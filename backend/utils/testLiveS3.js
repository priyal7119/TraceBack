require('dotenv').config();
const { S3Client, HeadObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const imageService = require('../services/imageService');
const reportService = require('../services/reportService');
const { s3Client, s3Bucket } = require('../config/aws');

async function runLiveS3Tests() {
  console.log('--- Starting Live AWS S3 Integration Tests ---');
  console.log(`Target Bucket: ${s3Bucket}`);

  let createdS3Key = null;

  try {
    // 1. Test Presigned PUT URL generation
    console.log('\n[1/6] Generating presigned PUT URL...');
    const uploadPayload = {
      fileType: 'image/jpeg',
      fileSize: 1024 * 10, // 10 KB
      type: 'lost'
    };
    const uploadResult = await imageService.getUploadUrl(uploadPayload);
    console.log('✓ Presigned upload URL generated successfully');
    console.log(`  Key: ${uploadResult.key || uploadResult.fileKey}`);
    console.log(`  Upload URL: ${uploadResult.uploadUrl.substring(0, 80)}...`);
    createdS3Key = uploadResult.key || uploadResult.fileKey;

    // 2. Perform actual HTTP PUT upload
    console.log('\n[2/6] Uploading binary image buffer to S3 via presigned PUT URL...');
    const dummyImageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
    const putResponse = await fetch(uploadResult.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg'
      },
      body: dummyImageBuffer
    });

    if (!putResponse.ok) {
      throw new Error(`Failed to upload to S3: ${putResponse.status} ${putResponse.statusText}`);
    }
    console.log(`✓ Image successfully uploaded to S3 (HTTP ${putResponse.status})`);

    // 3. Verify object in S3 using HeadObject
    console.log('\n[3/6] Verifying uploaded object directly in S3...');
    const headCommand = new HeadObjectCommand({
      Bucket: s3Bucket,
      Key: createdS3Key
    });
    const headOutput = await s3Client.send(headCommand);
    console.log('✓ HeadObject confirmed:');
    console.log(`  Content-Length: ${headOutput.ContentLength} bytes`);
    console.log(`  Content-Type: ${headOutput.ContentType}`);

    // 4. Test Presigned GET URL and fetch content
    console.log('\n[4/6] Generating presigned GET URL and fetching object...');
    const presignedGetUrl = await imageService.getPresignedGetUrl(createdS3Key);
    console.log(`  Presigned GET URL: ${presignedGetUrl.substring(0, 80)}...`);

    const getResponse = await fetch(presignedGetUrl);
    if (!getResponse.ok) {
      throw new Error(`Failed to download via presigned GET: ${getResponse.status}`);
    }
    const downloadedText = await getResponse.text();
    if (downloadedText !== dummyImageBuffer.toString()) {
      throw new Error('Downloaded content does not match uploaded content!');
    }
    console.log('✓ Content downloaded via presigned GET matches uploaded data exactly');

    // 5. Test report creation with S3 imageKey and retrieval with resolved URL
    console.log('\n[5/6] Creating report in DynamoDB referencing S3 imageKey...');
    const reportData = {
      title: 'S3 Integration Test Item',
      description: 'Verifying S3 key storage in report record',
      category: 'Electronics',
      type: 'lost',
      status: 'pending',
      date: new Date().toISOString(),
      location: 'Hamilton Campus Hall',
      image: uploadResult.publicUrl,
      imageKey: createdS3Key,
      s3Bucket: s3Bucket,
      imageMetadata: {
        contentType: 'image/jpeg',
        size: dummyImageBuffer.length,
        uploadedAt: new Date().toISOString()
      },
      contactInfo: {
        email: 'tester@traceback.local',
        phone: '123-456-7890'
      }
    };

    const createdReport = await reportService.createLostReport(reportData, 's3-test-user-id');
    console.log(`✓ Report created in DynamoDB with ID: ${createdReport.id}`);
    console.log(`  imageKey persisted: ${createdReport.imageKey}`);

    const retrievedReport = await reportService.getReportById(createdReport.id);
    console.log(`✓ Retrieved report image URL resolved: ${retrievedReport.image.substring(0, 80)}...`);
    if (!retrievedReport.image.includes(s3Bucket) || !retrievedReport.image.includes('X-Amz-Signature')) {
      throw new Error('Report image was not resolved to an AWS presigned URL!');
    }

    // Clean up test report from DynamoDB
    await reportService.deleteReport(createdReport.id, 's3-test-user-id', true);
    console.log('✓ Cleaned up test report from DynamoDB');

    // 6. Test Security / Validation Rules
    console.log('\n[6/6] Testing validation and access controls...');

    // a. File size validation (> 5MB)
    try {
      await imageService.getUploadUrl({ fileType: 'image/jpeg', fileSize: 6 * 1024 * 1024, type: 'lost' });
      throw new Error('Oversized file did not trigger validation error!');
    } catch (err) {
      if (err.message.includes('5MB')) {
        console.log('✓ File size limit (>5MB) properly rejected');
      } else {
        throw err;
      }
    }

    // b. Unsupported file type
    try {
      await imageService.getUploadUrl({ fileType: 'application/pdf', fileSize: 1024, type: 'lost' });
      throw new Error('Unsupported MIME type did not trigger validation error!');
    } catch (err) {
      if (err.message.includes('Invalid file type')) {
        console.log('✓ Unsupported MIME type properly rejected');
      } else {
        throw err;
      }
    }

    console.log('\n--- All Live AWS S3 Integration Tests Passed Successfully! ---');

  } finally {
    // Cleanup S3 object
    if (createdS3Key && s3Client) {
      console.log(`\n[Cleanup] Deleting test object from S3: ${createdS3Key}...`);
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: s3Bucket,
          Key: createdS3Key
        }));
        console.log('✓ Test S3 object deleted successfully');
      } catch (cleanupErr) {
        console.error('Warning: S3 cleanup failed:', cleanupErr.message);
      }
    }
  }
}

runLiveS3Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Live S3 Test Failure:', err);
    process.exit(1);
  });

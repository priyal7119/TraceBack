export const FALLBACK_ITEM_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';

export const isWebUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/');
};

export const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return FALLBACK_ITEM_IMAGE;
  const trimmed = url.trim();
  if (isWebUrl(trimmed)) {
    return trimmed;
  }
  // If it's a raw S3 key like 'uploads/lost/...', in dev local handler it's accessible via '/uploads/'
  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }
  return FALLBACK_ITEM_IMAGE;
};

export const getSafeImageList = (item) => {
  if (!item) {
    return [FALLBACK_ITEM_IMAGE];
  }

  // 1. If images is already an array with elements
  if (Array.isArray(item.images) && item.images.length > 0) {
    const cleanImages = item.images.filter(Boolean).map(sanitizeImageUrl);
    if (cleanImages.length > 0) return cleanImages;
  }

  // 2. If single image string property is present
  if (typeof item.image === 'string' && item.image.trim()) {
    return [sanitizeImageUrl(item.image.trim())];
  }

  return [FALLBACK_ITEM_IMAGE];
};

export const getSafeImage = (item, index = 0) => {
  const list = getSafeImageList(item);
  return list[index] ?? list[0] ?? FALLBACK_ITEM_IMAGE;
};

export const normalizeItems = (value = []) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const images = getSafeImageList(item);

    return {
      ...item,
      id: item?.id || item?.reportId || `item_${Date.now()}_${index}`,
      reportId: item?.reportId || item?.id || `item_${Date.now()}_${index}`,
      type: item?.type || 'found',
      title: typeof item?.title === 'string' && item.title.trim() ? item.title : 'Untitled Item',
      category: item?.category || 'Other',
      status: item?.status || 'active',
      description: item?.description || 'No description provided for this item.',
      location: item?.location || 'HAMC campus',
      date: item?.date || new Date().toISOString().slice(0, 10),
      image: images[0] || FALLBACK_ITEM_IMAGE,
      images,
      aiTags: Array.isArray(item?.aiTags) ? item.aiTags.filter(Boolean) : [],
      rekognitionConfidence: Number(item?.rekognitionConfidence) || 0,
      reportedBy: item?.reportedBy || { id: 'guest', name: 'Campus Member', role: 'guest' },
    };
  });
};

export const normalizeMatches = (value = []) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((m, index) => {
    if (!m) return null;

    const lostItem = m.lostItem ? {
      ...m.lostItem,
      id: m.lostItem.id || m.lostItemId || 'lost_item',
      title: m.lostItem.title || 'Reported Lost Item',
      category: m.lostItem.category || 'Belonging',
      location: m.lostItem.location || 'HAMC Campus',
      date: m.lostItem.date || 'Recent',
      time: m.lostItem.time || '12:00',
      description: m.lostItem.description || 'No description available',
      images: getSafeImageList(m.lostItem),
      image: getSafeImage(m.lostItem),
      brand: m.lostItem.brand || '',
      serialOrDistinctiveFeature: m.lostItem.serialOrDistinctiveFeature || m.lostItem.distinctFeatures || ''
    } : null;

    const foundItem = m.foundItem ? {
      ...m.foundItem,
      id: m.foundItem.id || m.foundItemId || 'found_item',
      title: m.foundItem.title || 'Found Custodial Item',
      category: m.foundItem.category || 'Belonging',
      location: m.foundItem.location || 'Custody Counter',
      storageLocation: m.foundItem.storageLocation || m.foundItem.custodyLocation || m.foundItem.location || 'Security Office',
      date: m.foundItem.date || 'Recent',
      time: m.foundItem.time || '12:00',
      description: m.foundItem.description || 'No description available',
      status: m.foundItem.status || 'active',
      images: getSafeImageList(m.foundItem),
      image: getSafeImage(m.foundItem),
      brand: m.foundItem.brand || '',
      distinctFeatures: m.foundItem.distinctFeatures || ''
    } : null;

    const overallScore = Number(m.overallScore) || 75;
    const visualSimilarity = (m.visualSimilarity !== undefined && m.visualSimilarity !== null)
      ? Number(m.visualSimilarity)
      : (m.scores?.imageLabels !== undefined && m.scores?.imageLabels !== null ? Number(m.scores.imageLabels) : null);
    const metadataSimilarity = Number(m.metadataSimilarity) || Math.round(overallScore);

    const matchedLabels = Array.isArray(m.aiComparison?.matchedLabels) && m.aiComparison.matchedLabels.length > 0
      ? m.aiComparison.matchedLabels.filter(Boolean)
      : [];

    const defaultInsights = visualSimilarity !== null
      ? `Amazon Rekognition feature analysis complete (${visualSimilarity}% visual label similarity).`
      : `Metadata affinity match (${overallScore}%) based on campus location and timeframe. Visual AI scan unavailable.`;

    const aiComparison = {
      matchedLabels,
      locationDistanceScore: m.aiComparison?.locationDistanceScore ?? 80,
      locationDistanceKm: m.aiComparison?.locationDistanceKm ?? 0.05,
      timeDifferenceHours: m.aiComparison?.timeDifferenceHours ?? 0.5,
      dateDifferenceDays: m.aiComparison?.dateDifferenceDays ?? 0,
      rekognitionInsights: m.aiComparison?.rekognitionInsights || defaultInsights,
    };

    return {
      ...m,
      id: m.id || m.matchId || `mtc_${Date.now()}_${index}`,
      matchId: m.matchId || m.id || `mtc_${Date.now()}_${index}`,
      overallScore,
      confidence: m.confidence || (overallScore >= 85 ? 'High' : overallScore >= 70 ? 'Medium' : 'Low'),
      visualSimilarity,
      metadataSimilarity,
      status: m.status || 'suggested',
      lostItem,
      foundItem,
      aiComparison
    };
  }).filter(Boolean);
};

# Performance Optimization Guide

## Image Optimization Strategy

### Recommended Specifications

**Hero Images** (Service Detail, Home):
- Dimensions: 420x240px
- Format: WebP
- Quality: 80%
- Target size: 8-12KB
- Progressive: Yes

**Service Card Images**:
- Dimensions: 160x120px
- Format: WebP
- Quality: 75%
- Target size: 4-6KB
- Progressive: Yes

**Profile Avatars**:
- Dimensions: 80x80px
- Format: WebP
- Quality: 85%
- Target size: 2-3KB
- Circle crop: Yes

### Conversion Commands

```bash
# Install cwebp (WebP encoder)
brew install webp  # macOS
apt-get install webp  # Ubuntu

# Convert single image
cwebp -q 80 input.jpg -o output.webp

# Batch convert all images in directory
for file in *.jpg; do
  cwebp -q 80 "$file" -o "${file%.jpg}.webp"
done

# Resize and convert
convert input.jpg -resize 420x240 -quality 80 output.webp
```

### React Native Fast Image Setup

```bash
# Install react-native-fast-image
npm install react-native-fast-image
cd ios && pod install
```

**Usage**:
```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>
```

---

## FlatList Performance Optimization

### Optimized Configuration

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  
  // Rendering optimization
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={10}
  removeClippedSubviews={true}
  
  // Layout optimization (if fixed height)
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  
  // Pagination
  onEndReachedThreshold={0.5}
  onEndReached={loadMore}
  
  // Performance
  updateCellsBatchingPeriod={50}
  maxToRenderPerBatch={10}
/>
```

### Memoization

```typescript
import { memo } from 'react';

const ServiceCardItem = memo(({ item, onPress }) => (
  <AnimatedCard onPress={() => onPress(item)}>
    <ServiceCard {...item} />
  </AnimatedCard>
));

// In FlatList
renderItem={({ item }) => (
  <ServiceCardItem item={item} onPress={handlePress} />
)}
```

---

## Bundle Size Optimization

### Current Analysis

```bash
# Analyze bundle
npx react-native-bundle-visualizer

# Target: <5MB total
# Breakdown:
# - App code: <2MB
# - Dependencies: <2.5MB
# - Assets: <500KB
```

### Optimization Strategies

**1. Code Splitting**:
```typescript
// Lazy load heavy screens
const ProfileScreen = lazy(() => import('./screens/Profile'));
const BookingDetailScreen = lazy(() => import('./screens/BookingDetail'));
```

**2. Remove Unused Dependencies**:
```bash
# Analyze dependencies
npx depcheck

# Remove unused
npm uninstall unused-package
```

**3. Tree Shaking**:
```javascript
// Import only what you need
import { map, filter } from 'lodash'; // ❌
import map from 'lodash/map'; // ✅
```

---

## Memory Profiling

### Target: <80MB

**Tools**:
- Xcode Instruments (iOS)
- Android Profiler (Android)
- React DevTools Profiler

**Common Issues**:
- Image caching (use FastImage)
- Event listeners not cleaned up
- Large state objects
- Circular references

**Solutions**:
```typescript
// Clean up listeners
useEffect(() => {
  const subscription = eventEmitter.addListener('event', handler);
  return () => subscription.remove();
}, []);

// Limit image cache
FastImage.clearMemoryCache();
FastImage.clearDiskCache();
```

---

## Performance Metrics

### Targets

| Metric | Target | Tool |
|--------|--------|------|
| Home load | <1.2s | Firebase Performance |
| Service list scroll | 60fps | React DevTools |
| Memory usage | <80MB | Xcode Instruments |
| Bundle size | <5MB | Metro bundler |
| JS thread | 60fps | Performance Monitor |
| UI thread | 60fps | Performance Monitor |

### Monitoring

```typescript
import perf from '@react-native-firebase/perf';

// Track screen load
const trace = await perf().startTrace('home_screen_load');
// ... load screen
await trace.stop();

// Track network requests
const httpMetric = perf().newHttpMetric(url, 'GET');
await httpMetric.start();
// ... make request
await httpMetric.stop();
```

---

## Testing Commands

```bash
# Run performance tests
npm run test:performance

# Profile bundle
npx react-native-bundle-visualizer

# Measure FPS
# Enable Performance Monitor in dev menu

# Memory profiling
# iOS: Xcode > Product > Profile > Leaks
# Android: Android Studio > Profiler

# Network profiling
# Flipper > Network plugin
```

---

## Checklist

- [ ] All images converted to WebP
- [ ] FastImage implemented
- [ ] FlatList optimized
- [ ] Components memoized
- [ ] Bundle size <5MB
- [ ] Memory usage <80MB
- [ ] 60fps scroll verified
- [ ] Load time <1.2s

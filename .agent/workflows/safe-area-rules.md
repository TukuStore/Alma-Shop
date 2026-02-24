---
description: Rules for handling Android system navigation bar overlaps on all screens
---

# Safe Area Bottom Inset Rules

Every screen in the AlmaStore mobile app **must** respect the Android system navigation bar (and the iOS home indicator). This prevents buttons and content from being hidden behind the system UI.

## Rule 1: Fixed Bottom Bars MUST use `useSafeAreaInsets`

Any component that uses `absolute bottom-0` positioning for a footer, action bar, or sticky button **MUST**:

1. Import `useSafeAreaInsets` from `react-native-safe-area-context`:
   ```tsx
   import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
   ```

2. Get the insets inside the component:
   ```tsx
   const insets = useSafeAreaInsets();
   ```

3. Apply `paddingBottom` to the absolute footer View using `Math.max(insets.bottom, <minPadding>)`:
   ```tsx
   <View
     className="absolute bottom-0 left-0 right-0 bg-white border-t ..."
     style={{ paddingBottom: Math.max(insets.bottom, 16) }}
   >
   ```

**DO NOT** use hardcoded `pb-8` or `pb-6` for bottom bars. These values will not account for different device navigation bar heights.

## Rule 2: SafeAreaView edges

- Tab screens (inside `(tabs)/`) only need `edges={['top']}` because the tab bar itself provides bottom padding.
- Non-tab screens with NO fixed bottom bar should use `edges={['top', 'bottom']}` on their `SafeAreaView`.
- Non-tab screens WITH a fixed bottom bar should use `edges={['top']}` on `SafeAreaView` and handle the bottom inset manually on the footer bar (Rule 1).

## Rule 3: ScrollView paddingBottom

When a screen has a fixed bottom bar, its `ScrollView` must have enough `paddingBottom` in `contentContainerStyle` to prevent content from being hidden behind the footer. Typically `paddingBottom: 120` or more.

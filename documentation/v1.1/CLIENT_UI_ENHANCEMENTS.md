# v1.1 Client UI/UX Enhancements

**Date:** November 30, 2025  
**Priority:** High - Immediate Implementation  
**Status:** In Progress

---

## 🎯 Requirements Overview

### 1. Hero Section Adjustment ✅
**Issue:** "Your Local Experts, Instantly" text takes main attention where focus should be on service groups

**Solution:** Reduce hero section size
- Decrease font size from `text-4xl sm:text-5xl` to `text-2xl sm:text-3xl`
- Reduce padding from `py-8` to `py-4`
- Simplify subtitle text
- Keep service grid prominent

---

### 2. Remove Sidebar Navigation ✅
**Issue:** Dashboard and Professional links in header menu are redundant

**Solution:** Remove from dropdown menu
- Keep only profile picture button
- Remove "Dashboard" link
- Remove "For Professionals" from mobile menu
- Keep "Sign Out" button
- Simplify header navigation

---

### 3. Editable Profile Picture ⏳
**Issue:** Users cannot update their profile picture

**Solution:** Implement profile picture upload
- Click profile picture to upload
- Show initials by default (First + Last name or email)
- Use Supabase Storage for uploads
- Update `profiles` table with `avatar_url`
- Add loading state during upload

---

### 4. Mobile Number Prompt ⏳
**Issue:** Need to highlight missing mobile numbers for dual auth

**Solution:** Add banner/notification
- Check if `phone` field is empty
- Show dismissible banner on dashboard
- "Add your mobile number for better security"
- Link to profile settings

---

### 5. Enhanced Footer Tab Highlighting ⏳
**Issue:** Active tab only highlights text, not visually distinct

**Solution:** Add visual indicators
- Background color change for active tab
- Icon color change
- Bottom border indicator
- Scale/elevation effect

---

### 6. Enhanced Service Card Selection ⏳
**Issue:** Selected service card only highlights text

**Solution:** Add 3D effects and motion
- Box shadow elevation on select
- Scale transform
- Border glow effect
- Smooth transitions
- Persist selection state

---

## 📋 Implementation Checklist

- [ ] 1. Reduce hero section size
- [ ] 2. Remove sidebar links from header
- [ ] 3. Implement profile picture upload
- [ ] 4. Add mobile number prompt banner
- [ ] 5. Enhance footer tab active state
- [ ] 6. Add 3D effects to selected service cards

---

## 🔧 Technical Details

### Profile Picture Upload
```typescript
// Use Supabase Storage
const uploadAvatar = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });
  
  // Update profile
  await supabase.from('profiles')
    .update({ avatar_url: data.path })
    .eq('id', user.id);
};
```

### Footer Tab Enhancement
```css
.tab-active {
  background: linear-gradient(to top, theme('colors.teal.50'), transparent);
  border-bottom: 3px solid theme('colors.teal.500');
  transform: translateY(-2px);
}
```

### Service Card 3D Effect
```css
.service-card-selected {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 3px theme('colors.teal.500');
}
```

---

**Next:** Implement each requirement systematically

# Deploy MD Vendor App — FREE on Netlify

## This is a SEPARATE app from the customer app
Deploy it to a different Netlify site so vendors get their own URL/icon.

## Build
```
npm install
npm run build
```

## Deploy
1. Go to **https://netlify.com**
2. Create a NEW site (different from the customer app site)
3. Drag the `build/` folder
4. Share the URL with your vendors

## Vendor installation on phone
Same process as customer app — tap Share → Add to Home Screen on iPhone, or use the Chrome install prompt on Android.

## Tip: Rename the sites in Netlify
- Customer app: `morning-delight.netlify.app`
- Vendor app:   `md-vendor.netlify.app`

You can customise these names for free in Netlify site settings.

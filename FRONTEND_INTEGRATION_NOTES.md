# Visezy Insurance Mobile Frontend Integration

The mobile app consumes `/api/auth/*`, `/api/user/*`, and `/api/policy/*` from this backend.

## Mobile profile upload
`POST /api/user/profile` accepts multipart fields:
- `name`, `email`, `dob`, `claimedPrevious`, `hasPreviousPolicy`, `vehicleDetails`
- `nomineeName`, `nomineeRelationship`, `nomineeDob`, `nomineeMobile`
- files: `rc`, `policy`, `aadhaar`, `pan`

## Cashback
The backend intentionally keeps reward amount under admin control. Admin issues a scratch card using:
`POST /api/admin/users/:userId/scratch-card` with `{ "amount": 250, "currency": "INR" }`.
The user can then fetch `/api/policy/my-scratch-card` and redeem it through `/api/policy/scratch`.

## Referral
The supplied backend did not contain a referral model or referral endpoints. The mobile UI shows the supplied ₹100 rule as a UI value, but actual referral eligibility/credit must be added server-side before production use.

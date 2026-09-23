const rewards = [
  '5% off on renewals',
  'Free roadside assistance add-on',
  'Amazon voucher worth ₹250',
  'Fuel cashback offer',
];

exports.getReward = () => rewards[Math.floor(Math.random() * rewards.length)];
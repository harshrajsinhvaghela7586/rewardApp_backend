const streamifier = require('streamifier');

const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');

/* ================================================= */
/* CLOUDINARY UPLOAD */
/* ================================================= */

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder: 'vinsure/banners',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        }
      );

    streamifier
      .createReadStream(file.buffer)
      .pipe(stream);
  });
};

/* ================================================= */
/* DELETE CLOUDINARY IMAGE */
/* ================================================= */

const deleteFromCloudinary = async (
  publicId
) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: 'image',
      }
    );
  } catch (error) {
    console.error(
      'Banner image delete error:',
      error.message
    );
  }
};

/* ================================================= */
/* PUBLIC - GET ACTIVE BANNERS */
/* ================================================= */

exports.getActiveBanners = async (
  req,
  res,
  next
) => {
  try {
    // PUBLIC
const banners = await Banner.find({
  isActive: true,
})
  .sort({
    order: 1,
    createdAt: -1,
  })
  .select(
    'title subtitle imageUrl ctaText isActive'
  )
  .lean();

    return res.json({
      success: true,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================================= */
/* ADMIN - GET ALL BANNERS */
/* ================================================= */

exports.getAllBanners = async (
  req,
  res,
  next
) => {
  try {
   // ADMIN
const banners = await Banner.find()
  .sort({
    order: 1,
    createdAt: -1,
  })
  .lean();

    return res.json({
      success: true,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================================= */
/* ADMIN - CREATE BANNER */
/* ================================================= */

exports.createBanner = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      subtitle,
      ctaText,
      isActive = true,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required.',
      });
    }

const lastBanner = await Banner.findOne()
  .sort({ order: -1 })
  .select('order')
  .lean();

const nextOrder = lastBanner
  ? Number(lastBanner.order || 0) + 1
  : 1;

    const upload =
      await uploadToCloudinary(req.file);

   const banner = await Banner.create({
  title: title?.trim() || '',
  subtitle: subtitle?.trim() || '',

  imageUrl: upload.secure_url,
  imagePublicId: upload.public_id,

  ctaText: ctaText?.trim() || '',

  order: nextOrder,

  isActive:
    isActive === true ||
    isActive === 'true',
});

    return res.status(201).json({
      success: true,
      message: 'Banner created successfully.',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================================= */
/* ADMIN - UPDATE BANNER */
/* ================================================= */

exports.updateBanner = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const banner =
      await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    const {
      title,
      subtitle,
      ctaText,
     isActive,
    } = req.body;

   

    if (title !== undefined) {
      banner.title = title.trim();
    }

    if (subtitle !== undefined) {
      banner.subtitle =
        subtitle.trim();
    }

    if (ctaText !== undefined) {
      banner.ctaText =
        ctaText.trim();
    }

    if (isActive !== undefined) {
      banner.isActive =
        isActive === true ||
        isActive === 'true';
    }

    /* ============================================= */
    /* NEW IMAGE */
    /* ============================================= */

    if (req.file) {
      const upload =
        await uploadToCloudinary(req.file);

      await deleteFromCloudinary(
        banner.imagePublicId
      );

      banner.imageUrl =
        upload.secure_url;

      banner.imagePublicId =
        upload.public_id;
    }

    await banner.save();

    return res.json({
      success: true,
      message: 'Banner updated successfully.',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

/* ================================================= */
/* ADMIN - DELETE BANNER */
/* ================================================= */

exports.deleteBanner = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const banner =
      await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    await deleteFromCloudinary(
      banner.imagePublicId
    );

    await Banner.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/* ================================================= */
/* ADMIN - TOGGLE ACTIVE */
/* ================================================= */

exports.toggleBanner = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const banner =
      await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    banner.isActive =
      !banner.isActive;

    await banner.save();

    return res.json({
      success: true,
      message: banner.isActive
        ? 'Banner activated successfully.'
        : 'Banner deactivated successfully.',
      banner,
    });
  } catch (error) {
    next(error);
  }
};
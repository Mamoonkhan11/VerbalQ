const AppSettings = require('../models/AppSettings');
const asyncHandler = require('../middleware/asyncHandler');

class AdminSettingsController {
  /**
   * Get application settings
   * GET /api/admin/settings
   */
  getSettings = asyncHandler(async (req, res) => {
    const settings = await AppSettings.getOrCreate();

    res.json({
      success: true,
      message: 'Settings retrieved successfully',
      data: {
        settings
      }
    });
  });

  /**
   * Update application settings
   * PUT /api/admin/settings
   */
  updateSettings = asyncHandler(async (req, res) => {
    const { grammarEnabled, translationEnabled, humanizeEnabled, plagiarismEnabled } = req.body;

    // Validate that at least one field is provided
    const updates = {};
    if (typeof grammarEnabled === 'boolean') updates.grammarEnabled = grammarEnabled;
    if (typeof translationEnabled === 'boolean') updates.translationEnabled = translationEnabled;
    if (typeof humanizeEnabled === 'boolean') updates.humanizeEnabled = humanizeEnabled;
    if (typeof plagiarismEnabled === 'boolean') updates.plagiarismEnabled = plagiarismEnabled;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one setting to update'
      });
    }

    // Get or create settings and update
    const settings = await AppSettings.getOrCreate();
    Object.assign(settings, updates);
    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings
      }
    });
  });
}

module.exports = new AdminSettingsController();
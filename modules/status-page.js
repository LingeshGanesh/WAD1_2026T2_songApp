/**
 * Render Internal Server Error Page
 * @param {Response} res response object
 * @param {string} message message string
 * @returns {void}
 */
exports.renderISE = (res, message) => {
    return res.status(500).render("status/internal", {message: message});
};

/**
 * Render Forbidden Page
 * @param {Response} res response object
 * @param {string} message message string
 * @returns {void}
 */
exports.renderForbidden = (res, message) => {
    return res.status(403).render("status/forbidden", {message: message});
};


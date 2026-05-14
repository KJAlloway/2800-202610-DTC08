/**
 * Health-check controller.
 */

export function getHealthStatus(req, res) {
    res.json({
        status: 'ok',
        service: 'ingredient-finder-api',
    });
}

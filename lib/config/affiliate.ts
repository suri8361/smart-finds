/**
 * Affiliate settings — the ONE place to switch stores on or off.
 *
 * AMAZON_ENABLED is OFF until Amazon Associates is confirmed for this site.
 * While it is off:
 *   - products whose store is Amazon (or whose link is an amazon.com /
 *     amzn.to link) are hidden from every public page, search and favorites;
 *   - Amazon is not listed under "Shop by Retailer".
 * Flip it to `true` (and redeploy) once the Amazon account is approved.
 */
export const AMAZON_ENABLED = false;

/** Amazon Associates store ID added to amazon.com links that don't already carry a tag. */
export const AMAZON_ASSOCIATE_TAG = "smartfind0a21-20";

/**
 * Amazon's Associates rules don't allow showing a saved price that may be out
 * of date, so Amazon products show this label instead of a dollar amount.
 */
export const AMAZON_PRICE_LABEL = "Check price on Amazon";

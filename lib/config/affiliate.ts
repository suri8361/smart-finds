/**
 * Affiliate settings — the ONE place to switch stores on or off.
 *
 * AMAZON_ENABLED is ON (Sara approved Amazon with store ID smartfind0a21-20,
 * Oct 26, 2026). If it is ever switched off:
 *   - products whose store is Amazon (or whose link is an amazon.com /
 *     amzn.to link) are hidden from every public page, search and favorites;
 *   - Amazon is not listed under "Shop by Retailer".
 * While it is on, Amazon products and the Amazon retailer are shown, amazon.com
 * links get the tag below when they have none, and Amazon items show
 * "Check price on Amazon" instead of a stored price.
 */
export const AMAZON_ENABLED = true;

/** Amazon Associates store ID added to amazon.com links that don't already carry a tag. */
export const AMAZON_ASSOCIATE_TAG = "smartfind0a21-20";

/**
 * Amazon's Associates rules don't allow showing a saved price that may be out
 * of date, so Amazon products show this label instead of a dollar amount.
 */
export const AMAZON_PRICE_LABEL = "Check price on Amazon";

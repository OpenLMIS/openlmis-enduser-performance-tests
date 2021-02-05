/**
 * Wait for the given element to become visible
 * @param  {String}   selector  Element selector
 * @param  {Boolean}   falseCase Whether or not to expect a visible or hidden state
 * @param  {Number}   timeout Maximum number of milliseconds to wait for
 *
 * @todo  merge with waitfor
 */
export default (selector, falseCase, timeout) => {
    /**
     * Maximum number of milliseconds to wait for
     * @type {Number}
     */
    const ms = 12000000;

    $(selector).waitForDisplayed({ timeout: timeout || ms, reverse: !!falseCase });
};

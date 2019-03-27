window.env = window.env || {};
window.env.RISE_ENV = "test";

TEMPLATE_PRODUCT_CODE = "TEMPLATE_PRODUCT_CODE";
TEMPLATE_VERSION = "TEMPLATE_VERSION";

window.mockNoInjectedConstants = function() {
  TEMPLATE_PRODUCT_CODE = undefined;
  TEMPLATE_VERSION = undefined;
};

window.resetInjectedConstants = function() {
  TEMPLATE_PRODUCT_CODE = "TEMPLATE_PRODUCT_CODE";
  TEMPLATE_VERSION = "TEMPLATE_VERSION";
};

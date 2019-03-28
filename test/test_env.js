window.env = window.env || {};
window.env.RISE_ENV = "test";

TEMPLATE_PRODUCT_CODE = "TEMPLATE_PRODUCT_CODE";
TEMPLATE_VERSION = "TEMPLATE_VERSION";
TEMPLATE_NAME = "TEMPLATE_NAME";

window.mockNoInjectedConstants = function() {
  TEMPLATE_PRODUCT_CODE = undefined;
  TEMPLATE_VERSION = undefined;
  TEMPLATE_NAME = undefined;
};

window.resetInjectedConstants = function() {
  TEMPLATE_PRODUCT_CODE = "TEMPLATE_PRODUCT_CODE";
  TEMPLATE_VERSION = "TEMPLATE_VERSION";
  TEMPLATE_NAME = "TEMPLATE_NAME";
};

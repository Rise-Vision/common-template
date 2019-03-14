/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable one-var */

RisePlayerConfiguration.Watch = (() => {

  function watchAttributeDataFile() {
    const companyId = RisePlayerConfiguration.getCompanyId();
    const presentationId = RisePlayerConfiguration.getPresentationId();

    const filePath = `${
      TEMPLATE_COMMON_CONFIG.GCS_COMPANY_BUCKET
    }/${
      companyId
    }/template-data/${
      presentationId
    }/published/${
      TEMPLATE_COMMON_CONFIG.GCS_ATTRIBUTE_DATA_FILE
    }`;

    RisePlayerConfiguration.LocalStorage.watchSingleFile( filePath, () => {
      // handle response
    });
  }

  return {
    watchAttributeDataFile: watchAttributeDataFile
  };

})();

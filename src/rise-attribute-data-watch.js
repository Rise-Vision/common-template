/* global TEMPLATE_COMMON_CONFIG */
/* eslint-disable no-console, one-var */

RisePlayerConfiguration.AttributeDataWatch = (() => {

  const ATTRIBUTE_DATA_WATCH_COMPONENT_DATA = {
    name: "RisePlayerConfiguration",
    id: "AttributeDataWatch",
    version: "N/A"
  };

  function watchAttributeDataFile() {
    const companyId = RisePlayerConfiguration.getCompanyId();
    const presentationId = RisePlayerConfiguration.getPresentationId();

    if ( !presentationId ) {
      // current templates won't have a presentation id, so they will make this far
      RisePlayerConfiguration.Logger.error(
        ATTRIBUTE_DATA_WATCH_COMPONENT_DATA,
        "no presentation id",
        "Can't send attribute data file watch"
      );

      return RisePlayerConfiguration.AttributeData.sendStartEvent();
    }

    // No need to get attribute data or sending start if there are no elements.
    if ( RisePlayerConfiguration.Helpers.getRiseElements().length === 0 ) {
      return;
    }

    const filePath = `${
      TEMPLATE_COMMON_CONFIG.GCS_COMPANY_BUCKET
    }/${
      companyId
    }/template-data/${
      presentationId
    }/published/${
      TEMPLATE_COMMON_CONFIG.GCS_ATTRIBUTE_DATA_FILE
    }`;

    RisePlayerConfiguration.Watch.watchDataFile( filePath, _handleAttributeDataFileAvailable, _handleAttributeDataFileUpdateError );
  }

  function _handleAttributeDataFileUpdateError() {
    return RisePlayerConfiguration.AttributeData.sendStartEvent();
  }

  function _handleAttributeDataFileAvailable( data ) {
    return RisePlayerConfiguration.AttributeData.update( data );
  }

  const exposedFunctions = {
    watchAttributeDataFile: watchAttributeDataFile
  };

  if ( RisePlayerConfiguration.Helpers.isTestEnvironment()) {
    Object.assign( exposedFunctions, {
      handleAttributeDataFileAvailable: _handleAttributeDataFileAvailable,
      handleAttributeDataFileUpdateError: _handleAttributeDataFileUpdateError
    });
  }

  return exposedFunctions;

})();

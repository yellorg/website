interface Event {
  type: string;
  name: string;
  params?: any;
}

const getRefQueryParam = (name: string, locationSearch: string) => {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(locationSearch);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

const utmParams = (locationSearch: string) => {
  const utmParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
  ];

  const params = utmParams.map(utm => {
      return {
          [utm]: getRefQueryParam(utm, locationSearch),
      }
  })

  return params;
};

const sendEvent = (event: string, name: string, params: any) => {
  console.log('Analytics:', event, name, params)
  if (!params) {
      (window as any).gtag && (window as any).gtag(event, name);
      (window as any).amplitude && (window as any).amplitude.getInstance().logEvent(name);
  } else {
      (window as any).gtag && (window as any).gtag(event, name, params);
      (window as any).amplitude && (window as any).amplitude.getInstance().logEvent(name, params);
  }
}

export const analytics = (analyticEvent: Event) => {
  switch (analyticEvent.type) {
      case 'otherEvent':
          sendEvent('event', analyticEvent.name, analyticEvent.params)
          break;
      case 'pageView':
          const location = window.location;
          let defaultParams = {
              ...analyticEvent.params,
          };

          if (location) {
              const utms = utmParams(location.search);

              defaultParams = {
                  ...defaultParams,
                  'path': location.pathname,
                  ...utms[0],
                  ...utms[1],
                  ...utms[2],
                  ...utms[3],
              }
          }

          sendEvent('event', analyticEvent.name, defaultParams)
          break;
      case 'user':
          // TODO: send user params
          // role
          break;
      case 'init':
          // TODO: send user params: created_at - registr data, role
          break;
      default:
          break;
  }
}

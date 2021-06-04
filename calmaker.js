(function(exports) {
  var globalScripts = [];

  var MS_IN_MINUTES = 60 * 1000;

  var formatTime = function(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  var calculateEndTime = function(event) {
    return event.end ?
      formatTime(event.end) :
      formatTime(new Date(event.start.getTime() + (event.duration * MS_IN_MINUTES)));
  };

  // icons data:
  var iconStyle      = 'width:30px;height:30px;vertical-align:middle;margin-right:5px;';
  var googleIconURL  = 'https://cdn.shopify.com/s/files/1/0078/2716/1145/files/google-icon.png';
  var yahooIconURL   = 'https://cdn.shopify.com/s/files/1/0078/2716/1145/files/yahoo-icon.png';
  var appleIconURL   = 'https://cdn.shopify.com/s/files/1/0078/2716/1145/files/apple-icon.png';
  var outlookIconURL = 'https://cdn.shopify.com/s/files/1/0078/2716/1145/files/outlook-icon.png';

  var calendarGenerators = {
    google: function(event) {
      var startTime = formatTime(event.start);
      var endTime = calculateEndTime(event);

      var href = encodeURI([
        'https://www.google.com/calendar/render',
        '?action=TEMPLATE',
        '&text=' + (event.title || ''),
        '&dates=' + (startTime || ''),
        '/' + (endTime || ''),
        '&details=' + (event.description || ''),
        '&location=' + (event.location || ''),
        '&sprop=&sprop=name:'
      ].join(''));

      var html = `<a target="_blank" href="${href}"><img style="${iconStyle}" src="${googleIconURL}">Google Calendar</a>`;
      return html;
    },

    yahoo: function(event) {
      var eventDuration = event.end ?
        ((event.end.getTime() - event.start.getTime())/ MS_IN_MINUTES) :
        event.duration;

      // Yahoo dates are crazy, we need to convert the duration from minutes to hh:mm
      var yahooHourDuration = eventDuration < 600 ?
        '0' + Math.floor((eventDuration / 60)) :
        Math.floor((eventDuration / 60)) + '';

      var yahooMinuteDuration = eventDuration % 60 < 10 ?
        '0' + eventDuration % 60 :
        eventDuration % 60 + '';

      var yahooEventDuration = yahooHourDuration + yahooMinuteDuration;

      // Remove timezone from event time
      var st = formatTime(new Date(event.start - (event.start.getTimezoneOffset() *
                                                  MS_IN_MINUTES))) || '';

      var href = encodeURI([
        'http://calendar.yahoo.com/?v=60&view=d&type=20',
        '&title=' + (event.title || ''),
        '&st=' + st,
        '&dur=' + (yahooEventDuration || ''),
        '&desc=' + (event.description || ''),
        '&in_loc=' + (event.location || '')
      ].join(''));

      var html = `<a target="_blank" href="${href}"><img style="${iconStyle}" src="${yahooIconURL}">Yahoo Calendar</a>`;
      return html;
    },


    ics: function(event, iconURL, calendarName) {
      var startTime = formatTime(event.start);
      var endTime = calculateEndTime(event);
      var description = event.description.replace(/\n/g, "\\n");

      var href = encodeURI(
        'data:text/calendar;charset=utf8,' + [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          'DTSTART:' + (startTime || ''),
          'DTEND:' + (endTime || ''),
          'SUMMARY:' + (event.title || ''),
          'DESCRIPTION:' + (description || ''),
          'LOCATION:' + (event.location || ''),
          'END:VEVENT',
          'END:VCALENDAR'].join('\n'));


      var id = Math.round(Math.random() * 1000000000); // create a random / unique ID
      var html = `<a id="${id}" href="${href}"><img style="${iconStyle}" src="${iconURL}">${calendarName}</a>`;

      // global script to force href into this <a> tag, because shoppify strips away data hrefs. grrr.
      globalScripts.push(`document.getElementById('${id}').href="${href}"`);

      return html;
    },


    ical: function(event) {
      return this.ics(event, appleIconURL, 'Apple iCal download');
    },

    outlook: function(event) {
      return this.ics(event, outlookIconURL, 'Outlook download');
    }
  };

  var generateCalendars = function(event) {
    return {
      google: calendarGenerators.google(event),
      yahoo: calendarGenerators.yahoo(event),
      ical: calendarGenerators.ical(event),
      outlook: calendarGenerators.outlook(event),
    };
  };


  // Make sure we have the necessary event data, such as start time and event duration
  var validateParams = function(params) {
    if (!params.start)
      params.start = new Date();

    if (!params.end)
      params.end = new Date(Date.parse(params.start) + 1000 * 3600);

    if (!params.title)
      params.title = 'New Event';

    if (!params.location)
      params.location = '';

    if (!params.description)
      params.description = '';
  };

  var generateMarkup = function(calendars, scripts) {
    var result = document.createElement('div');
    var html = '<div><ul style="list-style: none;">'

    Object.keys(calendars).forEach( function(services) {
      html +=  '<li style="margin: 15px;">' +  calendars[services] + '</li>';
    });

    html += '</ul></div>\n';

    // add any global scripts generated
    for (var i = 0; i < scripts.length; i++) {
      html += `<script>${scripts[i]}</script>\n`;
    }

    result.innerHTML = html;

    return result;
  };

  exports.createCalendar = function(params) {
    validateParams(params);
    globalScripts = [];
    var calData = generateCalendars(params);
    return generateMarkup(calData, globalScripts);
  };

})(this);

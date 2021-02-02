(function(exports) {
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
  var googleIconURL  = 'https://cdn.worldvectorlogo.com/logos/google-icon.svg';
  var yahooIconURL   = 'https://s.yimg.com/cv/apiv2/default/icons/favicon_y19_32x32_custom.svg';
  var appleIconURL   = 'https://www.svgrepo.com/show/69341/apple-logo.svg';
  var outlookIconURL = 'https://upload.wikimedia.org/wikipedia/commons/4/48/Outlook.com_icon.svg';

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

      var html = `<button onclick="window.location.href='${href}'"><img style="${iconStyle}" src="${iconURL}">${calendarName}</button>`;
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

  var generateMarkup = function(calendars, clazz, calendarId) {
    var result = document.createElement('div');
    var html = '<div><ul style="list-style: none;">'

    Object.keys(calendars).forEach( function(services) {
      html +=  '<li style="margin: 15px;">' +  calendars[services] + '</li>';
    });

    html += '</ul></div>';

    result.innerHTML = html;

    return result;
  };

  exports.createCalendar = function(params) {
    validateParams(params);
    return generateMarkup(generateCalendars(params));
  };
})(this);

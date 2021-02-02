
var onGenerate = function() {

  // Get values for the calendar
  var title       = document.getElementById('event-title').value;
  var start       = document.getElementById('start-time').value;
  var end         = document.getElementById('end-time').value;
  var location    = document.getElementById('event-location').value;
  var description = document.getElementById('event-description').value;

  if (start)
    start = new Date(start.replace(/-/g, ",").replace(/T/, " "));
  if (end)
    end = new Date(end.replace(/-/g, ",").replace(/T/, " "));

  var myCalendar = createCalendar({
    title: title,
    start: start,
    end: end,
    location: location,
    description: description,
  });

  // Add the calendar result and an example
  var liveExample = document.getElementById('live-example');
  if (liveExample.firstChild)
    liveExample.removeChild(liveExample.firstChild);
  liveExample.appendChild(myCalendar);

  document.getElementById('embed-text').value = myCalendar.innerHTML;

  // TODO show htmlResult, after first making it hidden...
  // var htmlResult = document.getElementById('html-result');

  return false;
};

var attachOnSubmit = function() {
  document.getElementById('calendar-generator').onsubmit = onGenerate;
}

window.onload = attachOnSubmit;

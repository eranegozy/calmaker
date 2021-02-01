
var onGenerate = function() {

  // Get values for the calendar
  var title       = document.getElementById('event-title').value;
  var startString = document.getElementById('start-time').value;
  var start       = new Date(startString.replace(/-/g, ",").replace(/T/, " "));
  var endString   = document.getElementById('end-time').value;
  var end         = new Date(endString.replace(/-/g, ",").replace(/T/, " "));
  var address     = document.getElementById('event-address').value;
  var description = document.getElementById('event-description').value;


  // Dummy test data for faster testing
  // start = new Date();
  // end = new Date();
  // title = 'Test Title'

  // Make sure basic info is passed in
  if (!(title && start && end)) {
    console.log('Add some details');
    return false;
  }

  // Create the calendar
  var myCalendar = createCalendar({
    data: {
      title: title,
      start: start,
      end: end,
      address: address,
      description: description
    }
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
  console.log('attachOnSubmit')
  document.getElementById('calendar-generator').onsubmit = onGenerate;
}

window.onload = attachOnSubmit;

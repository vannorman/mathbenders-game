// Define the colors for comparison results
var colors = {
bright_red: '\x1b[31m',
  bright_green: '\x1b[32m',
  bright_yellow: '\x1b[33m',
  bright_blue: '\x1b[34m',
  bright_magenta: '\x1b[35m',
  bright_cyan: '\x1b[36m',
  bright_white: '\x1b[37m',
  dark_red: '\x1b[31;1m',
  dark_green: '\x1b[32;1m',
  dark_yellow: '\x1b[33;1m',
  dark_blue: '\x1b[34;1m',
  dark_magenta: '\x1b[35;1m',
  dark_cyan: '\x1b[36;1m',
  dark_white: '\x1b[37;1m',
  reset_color: '\x1b[0m',
  background_color: '\x1b[48;5;${colorCode}m',
  };

// Helper function to colorize the output
function colorizeOutput(value, colorCode) {

  return colorCode + value + '\x1b[0m'; // Reset color
}

// Function to compare and track the tuples
function compareAndTrackTuples(tuple2,tuple1) {
  var delta = {
    x: (tuple2.x - tuple1.x).toFixed(3),
    y: (tuple2.y - tuple1.y).toFixed(3),
    z: (tuple2.z - tuple1.z).toFixed(3),
  };

  // Colorize the output based on the comparison results
  var xColor =
    delta.x > 0 ? colors.dark_green : delta.x < 0 ? colors.dark_red : '';
  var yColor =
    delta.y > 0 ? colors.dark_green : delta.y < 0 ? colors.dark_red : '';
  var zColor =
    delta.z > 0 ? colors.dark_green : delta.z < 0 ? colors.dark_red : '';

  // Output the delta values to the console with colored text
  console.log(
    'Delta X: ' +
      colorizeOutput(delta.x, xColor) +
      ', Delta Y: ' +
      colorizeOutput(delta.y, yColor) +
      ', Delta Z: ' +
      colorizeOutput(delta.z, zColor)
  );
}


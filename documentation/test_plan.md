# Test Plan

## Front End

### Configuration Panel

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.1.1        |   Functionality     |  "optimise" button can be pressed  | When the user presses the "optimise" button, the app should calculate and apply the optimal compression values. | Written - 14/11/24 | n/a |
| 1.1.2        |               |             |              |              |              |
| 1.1.3        |               |             |              |              |              |
| 1.1.4        |               |             |              |              |              |

### Compression Sidebar Panel

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.2.1        | Functionality          | Sidebar renders correctly when the app is opened, displaying the title and search box. | Ensures the basic UI elements load correctly. | Written - 18/11/24 | n/a |
| 1.2.2        | Functionality          | Clicking the button opens the sidebar when it is closed.            | Ensures the sidebar is displayed after clicking the button.      | Written - 18/11/24 | n/a |
| 1.2.3        | Functionality          | Clicking the button closes the sidebar when it is open.          | Ensures the sidebar is hidden after clicking the button.            |  Written - 18/11/24 | n/a |
| 1.2.4        | Functionality          | Clicking the "..." button shows a menu with Load, Edit, Download, and Delete options.        | Validates the menu appears with the correct options.      | Written - 18/11/24| n/a |
| 1.2.5        | Functionality          | Filters configurations based on the entered keyword (case-insensitive).            |  Keyword matching should work regardless of letter case.            | Written - 18/11/24| n/a |
| 1.2.6        | Functionality          | Shows "No matching configurations" when no names match the keyword.     |  Ensures user receives clear feedback when no results are found.               | Written - 18/11/24 | n/a |
| 1.2.7        | Functionality          | Clicking the magnifying glass activates the search input field.         | Ensures the input field is focused and ready for text.              |Written - 18/11/24 | n/a |
| 1.2.8        | Interaction            | Dynamically updates the list as the user types in the search box.       |  Ensures seamless user experience with real-time filtering.         |  Written - 18/11/24 | n/a |
| 1.2.9        | Edge Case              | Handles special characters (e.g., "&", "%") and overly long keywords without crashing. | Includes validation for uncommon input scenarios.    |  Written - 18/11/24| n/a |
| 1.2.10       | Responsiveness         | Sidebar and menus render correctly on both desktop and mobile devices.           | Ensures layout integrity across devices.            |Written - 18/11/24 | n/a |

### Compression Visualisation Graphs

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.3.1        |   Functionality     |  Graph renders on page  | When the user sends data to be compressed, the app should display the resulting compression graph | Written - 14/11/24 | n/a |
| 1.3.2        |               |             |              |              |              |
| 1.3.3        |               |             |              |              |              |
| 1.3.4        |               |             |              |              |              |

### Compression Matrix Table

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.4.1        | Functionality     | Displays original data metrics correctly.          | Verifies correct rendering of original dataset metrics. | Written - 14/11/24 | n/a |
| 1.4.2        | Functionality     | Displays optimal configuration metrics after running the compression algorithm.           | Ensures metrics like compression rate are accurate.  |Written - 18/11/24| n/a |
| 1.4.3        | Functionality     | Saves optimal configuration when "Save Optimal Configuration" button is clicked.           |  Confirms saved configuration metrics are accurate. | Written - 18/11/24| n/a |
| 1.4.4        | Functionality     | Updates the table dynamically when parameters are adjusted.            |  Ensures real-time table updates after parameter changes.               |Written - 18/11/24| n/a |
| 1.4.5        | Edge Case         | Handles empty datasets gracefully with "No data available" message.           |   Ensures proper feedback for empty inputs.                      | Written - 18/11/24| n/a |
| 1.4.6        | Edge Case         | Displays large datasets (e.g., millions of data points) correctly.          |  Verifies stable rendering for large datasets.                     | Written - 18/11/24 | n/a |
| 1.4.7        | UI/Interaction    | Scrollbar appears and functions smoothly for large datasets.            | Ensures usability for data-heavy tables.                               |Written - 18/11/24 | n/a |

### UI Layout

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.5.1        |   Functionality     |  The logo is present on the page. | Ensures the component is visible. | Written - 20/11/24 | n/a |
| 1.5.2        | Functionality | The configuration panel is present on the page.|Ensures the component is visible.|Written - 20/11/24| n/a |
| 1.5.3        | Functionality | The compression visualisation graph is present on the page.|Ensures the component is visible.|Written - 20/11/24| n/a |
| 1.5.4        | Functionality | The compression matrix is present on the page.|Ensures the component is visible.|Written - 20/11/24| n/a |
| 1.5.5        |Functionality | The save optimal parameters button is present on the page.|Ensures the component is visible.|Written - 20/11/24| n/a |
| 1.5.6        |Functionality | The sidebar toggle is present on the page.|Ensures the component is visible.|Written - 20/11/24| n/a |

## Back End

### Compression Algorithm


|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 2.1.1        |   Functionality        |  Verify the algorithm compresses data correctly | When data is passed into the compression algorithm, it successfully compresses it and outputs the compressed data. | Written - 14/11/24 | n/a |
| 2.1.2        |     Accuracy           |   Check that the compression retains critical data within acceptable limits.          |  Ensure key points are preserved while reducing less critical data.      | Written 16/11/24        |       n/a       |
| 2.1.3        |     Error Handling     |  Verify the algorithm handles invalid or malformed data properly.        |  The algorithm should return clear error messags or warnings for invalid input.      | Written 16/11/24     |  n/a     |
| 2.1.4        |     Configurability    | Ensure the algorithm correctly applies user-defined parameters.    | User-provided settings, like compression ratio, must affect the output as expected.     | Written 16/11/24     |    n/a      |
| 2.1.5        |     Scalability    |  Test te algorithm's ability to handle large datasets.     | The algorithm should compress up to 100,000,000 points without crashing or failing.     | Written 16/11/24      | n/a    |
| 2.1.6        |     Performance   | Ensure compression completes within a reasonable time.    | Compression time should not exceed 5 seconds for 1,000,000 points.    | Written 16/11/24     |     n/a         |
| 2.1.7        |     Integration   | Check that the algorithm integrates well with other components.      | Compressed data should work correctly with the Data Core API and visualisation tools.   | Written 16/11/24    | n/a      |
| 2.1.8        |     Output Metrics     |  Confirm the algorithm calculatees and displays metrics correctly.     | Metrics like storage savings, point counts and data fideltity must align with the actual results.      | Written 16/11/24    | n/a      |
| 2.1.9        |     Edge Cases         |  Test the algorithm with unusual or extreme datasets.      | Include datasets with single points, duplicates or high frequency noise.  | Written 16/11/24  | n/a    |


### Infrastructure

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 2.2.1        |   Functionality     |  Compression configuration can be stored  | When the user chooses to save configuration parameters, this is written into storage. | Written - 14/11/24 | n/a |
| 2.2.2        |               |             |              |              |              |
| 2.2.3        |               |             |              |              |              |
| 2.2.4        |               |             |              |              |              |
## Week 18

### 1st Meeting: 10/03/25

### Attendance
7/8 - Mayukhi, Kasia, Frazer, Libing, Will, Brendan and Lucas<br>
Missing Sai

### What happened?
1. Received feedback on UI and authentication
2. Feedback on parameter implementation
3. Feedback on data sources

##### 1. 
- Industry reccomended to remove firebase login service -> 3rd party login service which has potential to cause confusion
- Explanation of possible cookie implementation for Python implementation of user authentication

##### 2. 
- Callback filter should not be modifiable by user (purely used to complete a task for data elements which pass the other filters - check algorithm implementation `program.cs` file for info)
- Need to use the best data format so that the time at which the data was queried is saved -> this is important for the parameters to be able to efficiently filter the data (github page with information on data formats - get_processed_data, get_plot_data or get_raw_data)

##### 3. 
- Noisy Sin Wave only has 70 points -> option to create our own dataset with our own defined values


### Next Tasks
- Recreate diagram for Azure services (for future reference)
- Make changes to UI login options
- Get compression algorithm uploaded to git


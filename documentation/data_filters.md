# Data filters

## Tuneable Parameters

### Deviation Limit
- Value which decides how close a data point can be to another point before it is discarded (e.g. DeviationLimit = 2 means if two points are 2% or less different then one of them is discarded as they are too similar)
- Higher deviation means more aggressive compression (less data points stored), lower deviation limit means less compression (more data points stored, higher accuracy)

### Deviation type
- Either absolute e.g. 2 i.e. 2 points OR percentage e.g. 2 i.e. 2% either way

### Callback filter
- Can be used to filter out certain values e.g. smaller than or greater than a certain value e.g. reject all values less than 50 (fine grained control over what data gets processed)
- Can use custom rules?

### Exception filter
- Compares incoming samples to the last-emitted sample using deviation limits
- Checks timestamps of samples to see if they are too close together (?)

## Linking to optimisation
- Use optimisation algorithm after compression then run compression again with tuned values?
- Need default values to start with? (need to decide on what are our base values?)


## Questions to ask Josh
- How each of these parameters work? in this context
- Advice on which the users should be able to access/change? (should they be able to change all of them?)
- Define what is good compressed? i.e. what is compressed enough - value status variable in Model folder returning Good, Uncertain or Bad?
- Save after results after first run of compression algorithm and then depending on result of compression e.g Good, Uncertain or Bad, either run again or save to Azure infrastructure

## Feedback to questions
- All 4 of these parameters should be able to be modified by the user (need to build in functionality to the UI and check how to change them in the algorithm - getters & setters?)
- Optimisation work should be looked into only once the main functionality is working (added-extra opt-in feature for the user but not essential right now -> focus on producing something to show them in 2 weeks time before Easter break)

## Compression Tests
## Write tests here using python and the test plan

### Lucas : tests 1-5
### Kasia : tests 6-9

import unittest
import time

## check compression algorithm runs without issues/errors?
def test_check_compression():
    data = []
    # run compression algorithm
    assert()
    

## test for performance (time response)
def test_timeT():
    starttime = time.time()
    #  run compression algorithm for 1,000,000 points
    totaltime = round((time.time()) - starttime)
    print("Total time: " + str(totaltime))
    assert (totaltime < 5)


## We realised that for many of the compression algorithm tests,
## data is required from other parts of the system and so will
## likely feature more when we complete our integration/system
## testing later on.
## However, we have still written several short unit tests
## to ensure we are following test driven development
## and to make us think about the system as a whole as well 
## as the individual processes before we start programming.


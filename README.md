# Turn Sudonum Integration

A demo integration that shows how to expose an action inside Turn
that allows one to set up a call between a coach and an end user.

    $ export SUDONUM_API_TOKEN=<your token>
    $ export OPERATOR_NUMBER=<the number of your coach>
    $ export CALL_FROM=<the number you want to show up on the users phone>
    $ export SECRET=<the secret key for your integration>
    $ DEBUG=turn* yarn start

![screenshot](https://github.com/turnhub/turnio-sudonum/raw/master/screenshot.png)

![screenshot](https://github.com/turnhub/turnio-sudonum/raw/master/call-log.png)

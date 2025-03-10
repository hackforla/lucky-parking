# Instructions to use docker

## To build the image:

Go to this directory and run:

`docker build . -t luckyparking`

## To run the container:

`docker run -it -p 8888:8888 -v <replace this with your local directory>:/home luckyparking`

For example:

`docker run -it -p 8888:8888 -v /c/Users/Francis/lucky-parking:/home luckyparking`
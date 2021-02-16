FROM ubuntu:latest

ENV PATH="/root/miniconda3/bin:${PATH}"
ARG PATH="/root/miniconda3/bin:${PATH}"

RUN mkdir /root/home/lucky-parking

ADD . /root/home/lucky-parking

RUN ls

RUN apt update \
    && apt install -y make wget

RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
    && mkdir root/.conda \
    && sh Miniconda3-latest-Linux-x86_64.sh -b \
    && rm -f Miniconda3-latest-Linux-x86_64.sh

RUN /bin/bash -c "cd home/lucky-parking/ \
    && make create_environment \ 
    && conda init bash \
    && exec bash"

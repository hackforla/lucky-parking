all:
	@echo "Downloading whole dataset to data folder"
	wget -O ./data/`date +%Y-%m-%d`_full.csv https://data.lacity.org/api/views/wjz9-h9np/rows.csv?accessType=DOWNLOAD


from time import sleep
import csv
import urllib2
import requests
from bs4 import BeautifulSoup

with open('fraud_zips.csv', 'w+') as csvfile:
	writer = csv.writer(csvfile)
	writer.writerow(['Postcode', '1P_fraud', '3P_fraud', 'Population'])

with open('/Users/jermaine/Documents/python/final_eng_zips.csv', 'r') as f:
	zips = []
	for row in csv.reader(f, delimiter=',', quoting=csv.QUOTE_NONE):
			zips += row

def fraud_data(postcode):
	payload = {'ps':postcode}
	response = requests.get('http://52.19.27.200/fraud-map/', params=payload)
	data = response.json()['data']
	rs = data['postcode_sector'], data['first_party_fraud'], data['third_party_fraud'], data['population']
	with open('fraud_zips.csv', 'a') as csvfile:
		writer = csv.writer(csvfile)
		writer.writerow(rs)
	sleep(0.1)
	
	
map(fraud_data, zips)

# need to find a way to compute all the zips 
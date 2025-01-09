import sys
import json
import yfinance as yf

#################################
########### Functions ###########
#################################

def tickerToCompany(ticker):
  '''
  Returns the name of the company associated with ticker `ticker`. 
  Uses yfinance API.
  '''
  dat = yf.Ticker(ticker)
  
  if ('longName' in dat.info):
    return dat.info['longName']
  elif ('shortName' in dat.info):
    return dat.info['shortName']
  
  return 'N/A'
  
  
#########################################
########### Function Registry ###########
#########################################

functions = {
  'tickerToCompany': tickerToCompany
}

####################################
########### Running Code ###########
####################################

if __name__ == '__main__':
  input_data = json.loads(sys.stdin.read())
  
  function_name = input_data.get('function')
  args = input_data.get('args', {})
  
  result = functions[function_name](**args)
  print(json.dumps({'result': result}))
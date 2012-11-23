require "Date"
require "Time"
require "net/http"
require "uri"
require "json"

@base_url = "https://api.instagram.com/v1/users/%d/media/recent/"

user_ids = [
39869651, # sonkami321
803970, # shinjinem
130869 # gom
]

def get_timestamp(y, m) 
  start_date = DateTime.new(y, m, 1, 0, 0, 0)
  end_date = start_date >> 1
  end_date = end_date - 1
  #puts start_date
  #puts end_date
  return [Time.parse(start_date.to_s).to_i, Time.parse(start_date.to_s).to_i]
end

def do_request(y, m, uid)
  uri = URI.parse(sprintf(@base_url, uid));
  minmax = get_timestamp(y, m)
  q = sprintf("?access_token=130869.5b90a7e.4677642c0fdd4990968f70b7adf2207a&min_timestamp=%d", minmax[0])
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE
  req = Net::HTTP::Get.new(uri.path + q)
  res = http.request(req)
  #puts res.body
  json = JSON.parse(res.body)
  #puts json["pagination"]["next_url"]
  return json
end

def do_request_with_url(url)
  q = ""
  if url =~ %r{\?(.*)$}
    q = "?" + $1
  end 
  uri = URI.parse(url);
  http = Net::HTTP.new(uri.host, uri.port)
 http.use_ssl = true
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE
  req = Net::HTTP::Get.new(uri.path + q)
  res = http.request(req)
  #puts res.body
  json = JSON.parse(res.body)
  #puts json["pagination"]["next_url"]
  return json
end


def loop_request(uid)
  json = do_request(2011, 11, uid)
  #json = do_request(2012, 10, uid)
  @images += json["data"]
  next_url = json["pagination"]["next_url"]
  if ! next_url.to_s.empty?
    loop_with_url(next_url)
  end
end

def loop_with_url(url)
  puts url
  json = do_request_with_url(url)
  @images += json["data"]
  next_url = json["pagination"]["next_url"]
  if ! next_url.to_s.empty?
    loop_with_url(next_url)
  end
end


user_ids.each do |uid|
  puts "UID #{uid}"
  @images = []
  loop_request(uid)
  puts @images.length.to_s + " images found."
  open("#{uid}.json", "w+") do |io|
    io.puts @images.to_json
  end
end

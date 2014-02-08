#!/usr/bin/ruby -w

require 'json'

def generate_country_code_map
  mapping_data_file = File.open("country_code_mapping.csv", "r")
  ccode_map = {}

  mapping_data_file.each_line do |line|
    country_codes = line.split(/\t/)
    ccode_map[country_codes[1]] = country_codes[3].chomp
  end
 
  puts "Map Length=>#{ccode_map.length}"
  #puts ccode_map
  return ccode_map
end

def generate_info_hash
  country_code_map = generate_country_code_map
  countries = {}

  # original gtd_data in csv format
  gtd_data_file = File.open("gtd.csv", "r")
  data_obj = []

  gtd_data_file.each do |line|
    # event_info array:
    #  0 -> eventid
    #  1 -> year
    #  2 -> month
    #  3 -> day
    #  4 -> country code
    #  5 -> country name
    #  6 -> number of kill
    #  7 -> summary of accident
    event_info  = line.split(/\t/)
    event_id    = event_info[0]
    country     = event_info[5]
    year        = event_info[1]
    month       = event_info[2]
    day         = event_info[3]
    nkill       = event_info[6]
    
    #unless countries.has_key?(country)
    #  countries[country] = 0
    #end
    #countries[country] += 1

    if not country_code_map.has_key?(country)
      puts "Missing Code: #{country}"
    end

    data_obj << {
      :country => country_code_map[country],
      :year    => year,
      :month   => month,
      :day     => day,
      :nkill   => nkill,
      :id      => event_id
    } 
  end

  gtd_data_file.close

  countries.keys.each do |key|
    puts "#{key}\t#{countries[key]}"
  end

  puts data_obj.length
  return data_obj
end

def fprint_in_json data_hash, filename
  json_file = File.open(filename,"w+")
  json_file << data_hash.to_json
  json_file.close
end

def generate_sum_of_kill_by_month
  # get all the data form file
  data_obj = generate_info_hash
  
  # Create & initialize the data table
  sum_of_nkill_table = {}
  (2000..2010).map{|x| sum_of_nkill_table[x] = Array.new(12, 0)}

  puts sum_of_nkill_table

  # fill the table
  data_obj.each do |event|
    year  = event[:year].to_i
    month = event[:month].to_i
    nkill = event[:nkill].to_i
    puts "#{year}:#{month}:#{nkill}"

    sum_of_nkill_table[year][month - 1] += nkill
  end

  return sum_of_nkill_table
end

if $0 == __FILE__
  # print the gtd.json
  data_obj = generate_info_hash
  fprint_in_json data_obj, "gtd.json"

  # print the sum_table.json
  #fprint_in_json generate_sum_of_kill_by_month, "sum_table.json"

end


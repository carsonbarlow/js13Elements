puts "hello world"

puts ARGV[0]


f = File.open(ARGV[0], "r")
data = f.read
f.close


data = data[(data.index(' d=')+4)..-1]
data = data[0..(data.index('/>')-2)]
data.gsub!("\t",'').gsub!("\n",' ')
data.gsub!('M',"\nM").gsub!("L","\nL").gsub!("l","\nl")
# data_array = data.split(/[MLl]/)
data_array = data.split("\n")
data_array.shift

number_array = []
data_array.each do |d|
  new_array =[]
  if d.include?(',')
    new_array = d.split(',')
  else
    new_array = d[1..-1].sub('-',' -').split(' ')
  end
  new_array.map! {|x| x.to_i}
  # puts "#{new_array[0]} - #{new_array[1]}"
  new_array.unshift(d[0])
  number_array << new_array
end

output_string = ''

number_array.each do |n|
  output_string << "[#{n[0]},#{n[1]},#{n[2]}],\n"
end

output_string = output_string[0..-3]
# puts data_array[3]
File.open('output.txt', 'w') { |file| file.write(output_string) }














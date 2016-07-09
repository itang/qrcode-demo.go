task default: :usage


desc 'usage'
task :usage do
  sh 'rake -T'
end


file 'main' => %w(main.go) do
  sh 'go build main.go'
end


desc 'run2'
task run2: ['main'] do
  sh './main'
end


desc 'run'
task :run do
  sh 'iris run main.go'
end


namespace "update" do

  desc 'update iris cmd'
  task :iris do
    sh 'go get -u github.com/kataras/iris/iris'
  end
end


Vagrant.configure(2) do |config| 
  config.vm.box = "ubuntu/xenial64"
  config.vm.hostname = "ECGServer"

  config.vm.network "private_network", ip: "192.168.50.3"
  config.vm.network :forwarded_port, guest: 80, host: 8080, auto_correct: true
  config.vm.provision :shell, path: ".provision/webserver.sh"
end
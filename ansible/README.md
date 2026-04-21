# Module 13

Ansible

## VM Setup

Set up a VM with Virtual Box on my Macbook Pro (ARM)

### VM Props

user: foo
Storage: 25g
RAM: 8G
Processors 4
Network: Bridged Adapter
hostname: sample-server

### Initial Boot

Do a normal install, and turn on ssh server. However, no need to use any of the key properties at this time.
After you log in the first time, conduct a `hostname -I` to confirm IP is on your network

### Tasks from Macbook Pro

```bash
# the destination is the defined host name, but you can also use the IP Address.
ssh-copy-id foo@sample-server
# You will be queued for a password for setup of the id.
```

Note: You can use `-i` in order to specify the identity file to use if you have multiple.

## Ansible

If you did not already, install Ansible. `brew update && brew install ansible` will handle the task if youre using Homebrew. For Documentation or additional install options, you can visit: [Ansible](https://docs.ansible.com/)

### Defining your Inventory File

Your inventory.yml file is used to understand the scope of servers that will be handled through this script. For exmaple, in this case we are just going to have 1 item called `server`, but when dealing with configuration at scale you can define names to group various servers in different ways so that you can configure a baseline server definition.

### NOTE

All servers defined need to have ssh creds set up since that is how things are processed. This is also why up in the [VM Setup](#vm-setup) I setup the server but passed an SSH public key for the vm to use, so my host can interact with the server through ssh.

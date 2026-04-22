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

Since I was creating a sample user and password for becoming root, it was defined in my inventory file.

### Executing the Commands

To execute our deployment script, we would want to run the command:

```bash
ansible-playbook -i inventory.yml deploy.yml
```

This is a change off of the given assignment, as there was no defined inventory file, which is important to enable iteration ( for later ). I also updated who it applies to, do i updated hosts in [deploy.yml](deploy.yml) to reference `server` which is the defined keyword in the [inventory file](inventory.yml).

It told me to reference the pem file, but I already confirmed and set the Hosts pub file by using `ssh-copy-id` aboce.

### Mutating the deploy file

The postgres tooling needed to be augmented with 2 seperate entries. One is the same user creation, but `priv` is no longer a valid command. To fix this, we just appended a new step to Grant Privledges for the POstgres user.

File copying is taking longer than it should and seems to hang, even thought is did seem to copy it all. I ended up changing the query around so it isnt hangining. it is using find and then piping all the information into a copy command.

I added a task for a `npm ci` and `npm build` because i want to make sure that the packages are all correct and that the dist file is properly set up and ready for use. I do this to make sure that I am using the correct packages based on any OS constraints. Similarly, I want to make sure that dist is properly set up and built for consumption.

### Rollback

This is executed the same way deploy.yml is, `ansible-playbook -i inventory.yml rollback.yml` and it will essentially run a cleanup script which is essentially the reverse order of the deploy.yml file. We stop and remove the pm2 stuff, then delete the app folder and then uninstall postgres.

### Test Script

This was slightly augmented since there is no base route, so referencing sample-server:3000, it WILL fail. So i just grab the simplest route: /api/orders, so under the hood, the test script will call: `sample-server:3000/api/orders` and will return either an empty array OR a list of orders

### NOTE

All servers defined need to have ssh creds set up since that is how things are processed. This is also why up in the [VM Setup](#vm-setup) I setup the server but passed an SSH public key for the vm to use, so my host can interact with the server through ssh.

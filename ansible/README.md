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
# You will be asked for a password for setup of the id.
```

Note: You can use `-i` in order to specify the identity file to use if you have multiple.

Setting this up enables me to not have to supply a specific identity file for each commandline execution.

## Ansible

If you did not already, install Ansible. `brew update && brew install ansible` will handle the task if youre using Homebrew on a Mac. For Documentation or additional install options, you can visit: [Ansible](https://docs.ansible.com/). I generally use a Package Manager for all my things to keep them up to date.

### Defining your Inventory File

Your inventory.yml file is used to understand the scope of servers that will be handled through this script. For exmaple, in this case we are just going to have 1 item called `server`, but when dealing with configuration at scale you can define names to group various servers in different ways so that you can configure a baseline server definition.

Since I was creating a sample user and password for becoming root, it was defined in my inventory file. This is poor form and should either be an ENV file, Vault, or Secret. This is a note IN the inventory file, but since I am breaking it down and the information is just for a demo, it felt ok to have for this purpose.

### Executing the Commands

You need to be in the ansible folder for this to execute AS below.
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

This is executed the same way deploy.yml is, `ansible-playbook -i inventory.yml rollback.yml` and it will essentially run a cleanup script which is essentially the reverse order of the deploy.yml file. We stop and remove the pm2 stuff, then delete the app folder and then uninstall postgres. Since deploy also installs npm, nodejs AND installs a global npm package pm2, I also removed those.

### Test Script

This was slightly augmented since there is no base route, so referencing sample-server:3000, it WILL fail. So i just grab the simplest route: /api/orders, so under the hood, the test script will call: `sample-server:3000/api/orders` and will return either an empty array OR a list of orders that exists in memeory.

### NOTE

All servers defined need to have ssh creds set up since that is how things are processed. This is also why up in the [VM Setup](#vm-setup) I setup the server but passed an SSH public key for the vm to use, so my host can interact with the server through ssh.

My application does not use Postgres at all. However as a part of the class, the intent is to show the add and removal of different processes. This is NOT needed for my application design as it is built with Sqlite3.

### Insights and Lessons Learned

Setting up the VM was a bit annoying at first because there was an architecture issue. It was running on my mac in virtual box, and was not using the ARM build by accident.

Defining invetory files is straight forward as it is a create way to group all servers together. This creates a way for us to lump servers together and created nested setups for specific target sets. For larger scale, this could be generated by a script for scnearios where you have hundreds of servers you are working with, however based on our discussions of repeatability, maintaining it in a Repo enables us to ensure we dont lose track of specific servers.

the base deploy and rollback scripts were like 75% of the way there. We needed to account for newer releases of ansible to interpret everything accordingly. So I linearly went through the tasks and made adjustments that make sense.

Ansible runs in parallel for servers based on what you set it up as. There are some things such as servers at scale or tasks that take longer to achieve that create confusion, specifically where a progress bar for a specific task. It just ssh's in and calls a command so there is no way of knowing progress individually for a server. This creates an issue where you may have a control node that takes a really long time to run a playbook because of the pure number of servers being iterated on to update or make changes. I would like to know if there is a better way to frame this. For example: you DO get feedback by server when the task is ok or changed, but it would be nicer to know where in progress specific items are in the process of a specific task. It would be nice if there was a better progress similar to Homebrew, which will show where it is in the specific state of the list of servers.

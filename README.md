# express_demo

The purpose of this demo is to create a sample Swagger API for some simple crud operations.

## Cluster Offline

For demo purposes, this is using a service account for a cluster I have since offlined. Due to that, the deployment action part of the github action is currently going to fail at the gcloud.

## Tasks to Complete

- [x] Documentation of Events
- [x] POST /orders/
- [x] GET /orders/
- [x] GET /orders/:id
- [x] PATCH /orders/:id
- [x] DELETE /orders/:id
- [x] Swagger API
- [x] Simple SQLITE DB for storage
- [x] [OPTIONAL] Tests using Jest
- [x] Delay on POST order
- [x] Added a POSTMAN [Collection](./POSTMAN-collection.json)
- [x] Update Order Definition to have a state string.
- [x] Error Proofing to make sure data is what it is suppose to be

## Setup

The setup for this application is very basic for node applications.

```bash
npm ci
npm run start
```

## Postman

For some samples, import the [POSTMAN](./POSTMAN-collection.json) file into your application.

As long as the app is running, it is going to be available to query against with POSTMAN. By default, when you first run the application, it will create a new SQLITE database for you. If you want to see the api, you can go to [API DOCS](http://localhost:3000/api-docs) to see the Swagger API. Note, to see the _API DOCS_ above, the app needs to be running.

To test against POSTMAN, you will see the following:

- Get All Orders: Will get all orders
- Get Order by Id: Will get a specific order if it exists
- Post data: Will create a new Order. The only required property is name.
  - You are welcome to do a few Posts, so you can see all the orders in the list ( in the above get all orders ).
- Update Order will let you update the name or status based on the body passed into the call.
- Delete an order, will delete an order if it exists.
- Get Id that doesnt exist: This was a sample to show error handling.

### Images of Responses

![Getting All Orders](./images/Screenshot%202026-03-24%20at%2022.13.47.png)
![Getting Order By Id](./images/Screenshot%202026-03-24%20at%2022.14.05.png)
![Adding a new Order](./images/Screenshot%202026-03-24%20at%2022.14.29.png)
![mutate an order](./images/Screenshot%202026-03-24%20at%2022.14.50.png)
![Delete](./images/Screenshot%202026-03-24%20at%2022.15.01.png)
![Trying to Delete it a Second time](./images/Screenshot%202026-03-24%20at%2022.15.12.png)

## Docker and K8s

Building your Docker image requires that your docker daemon is running.

### Docker

```bash
docker build -t mod10 .
docker run -d -p 3000:3000 mod10
```

If you want to push it to the docker hub, make sure you log in, create a repo and then create a build with the correct tag.

```bash
docker login
docker build -t fallenreaper/csc820-mod10 .
docker push fallenreaper/csc820-mod10
```

### K8S

Using a local instance can be done, but in order to have it properly exposed, we need to use something like the Google Kubernetes Engine ( GKE ).

#### Set up of GKE

If you are able to, set up a new acconut to get $300 of credit for 90 days. This is good for testing. The website itself can be a bit much to deal with but you should be able to access it through here [GKE](https://console.cloud.google.com/kubernetes/clusters). You will first create your cluster which can take like 10 minutes.

#### Use of `gcloud` cask

If youre on Mac, use brew to install gcloud. `brew install ---cask gcloud-cli`

#### Now what?

After the Cluster is set up, there is a connection string you can use when it says "connect to cluster". This will essentially update the scope of kubectl in order to point to that cluster for any configurations. In our demo, we will want to make use of the `deployment.yaml` and `service.yaml` files to stand up and trigger it to work.

After the nodes are all stood up and the service sets up for an external IP, you can then access it on the internet. Note, it is also not necessarily immediate and can be 1-10 minutes to get updated with the IP being allowed.

## Github Actions

### Service Account

First I need to create a service account to access K8s

```bash

# Sample Project Id: foo-bar-000001
# Sample Service Account: meow

# Which Project it is being assigned to. Use its IDENTIFIER
gcloud config set project [PROJECT_ID]
# Creates the account.
gcloud iam service-accounts create "[SERVICE_ACCOUNT]" \
    --display-name "GitHub Actions GKE Deployer"
gcloud projects add-iam-policy-binding [PROJECT_ID] \
    --member="serviceAccount:[SERVICE_ACCOUNT]@[PROJECT_ID].iam.gserviceaccount.com" \
    --role="roles/container.developer"
gcloud iam service-accounts keys create ./key.json \
    --iam-account=[SERVICE_ACCOUNT]@[PROJECT_ID].iam.gserviceaccount.com

```

This is used as a means to properly set up the information you need in order to stand up the correct service account. This is a good enabler.

For consistancey, I set up the Token in Sercrets to be set as a B64 encoded string so I mask it a bit more.

## Notes

There was not specific schema we were to adhere to, so I just created a simple project with a few properties.

I incorporated `zod` as a means to do schema validation for POST/PATCH events. In other tools, you can also directly incorporate it into the database queries as well, but I wanted to not add too many additional packages.

### K8S Issues

While running locally, I was not having issues, but there are hardware issues I needed to address. One is ownership of the container stuff, which you see me using chown in the Dockerfile.

When running in k8s, I am using a mac, so it is built for ARM, but I was getting a lot of backoff because it was pulling ARM containers into a x86_64 system which seemed to keep getting errors and crash backoffs. I needed to add a nodeSelector which a platform definition.

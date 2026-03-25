# express_demo

The purpose of this demo is to create a sample Swagger API for some simple crud operations.

## Tasks to Complete

- [x] Documentation of Events
- [x] POST /orders/
- [x] GET /orders/
- [x] GET /orders/:id
- [x] PATCH /orders/:id
- [x] DELETE /orders/:id
- [x] Swagger API
- [x] Simple SQLITE DB for storage
- [ ] [OPTIONAL] Tests using Jest
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

## Notes

There was not specific schema we were to adhere to, so I just created a simple project with a few properties.

I incorporated `zod` as a means to do schema validation for POST/PATCH events. In other tools, you can also directly incorporate it into the database queries as well, but I wanted to not add too many additional packages.

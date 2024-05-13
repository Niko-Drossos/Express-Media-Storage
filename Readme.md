# Express Media Server
<p>This project is an home media server built with ExpressJs and using MongoDB's GridFs to store file data</p>

+ [Installation](#installation)
    + [Database](##Database)
        + [MongoDB local setup](https://www.prisma.io/dataguide/mongodb/setting-up-a-local-mongodb-database)
        + [MongoDB Alas setup]()
    + [Express setup](##Express)


+ [Credits](#Credits)

# Installation

## Database

## GridFs
<p>To store files we use MongoDB's <code>GridFs</code> which chunks files and stores them in 16mb documents</p>

## Express
<p>To get the server running clone this <a href="https://github.com/Niko-Drossos/Express-Media-Storage">repo</a> or by running this command in the directory you want it stored.</p>

```
git clone https://github.com/Niko-Drossos/Express-Media-Storage.git
```

<p>After you complete that CD into the new directory.</p>

```
cd Express-Media-Storage
```

<p>Once you are in the proper directory you need to install all the <code>npm</code> packages.</p> 

```
npm install
```

<p>And, thats it! the server is installed and you can start to configure it.  The first thing you need to do is make an <code>.env</code> file, this will allow you to change certain aspects of the server.</p>
<p>The <code>.env</code> file can contain these properties,</p> 

- **Mongo_Connection_Uri** - Determines which database to connect to. Can be cloud or local. 
- **JWT_SECRET_KEY** - Secret key used to generate and decrypt <code>Json Web Tokens</code> for user authentication. This key can be any value but its better to <a href="https://jwtsecret.com/generate">generate</a> one for security.
- **PORT** - This is <b>optional</b>, if not set the default port for the server is <code>3000</code>.






# Credits
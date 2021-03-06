# Self-hosting Ptorx

Hosting Ptorx yourself gives you a greater level of control and privacy (assuming you set everything up correctly) but it does come at a cost: it's not a simple process. If you need a self-hosted Ptorx installation you can either follow this tutorial with no support should you get stuck, or you can hire us to do it for you by sending an email to contact@xyfir.com. Many steps will be vague and generalized, so you'll be expected to know how to fill in the blanks based on your environment and requirements.

# Requisites

- Access to a domain whose DNS records you can configure.
- A Linux server (we'll use Ubuntu) whose host allows it to send mail, which primarily means that outgoing port 25 should be open.
- Know-how to set up a secure server before we install Ptorx onto it.
- Nginx or similar software installed to serve static files and act as a proxy for Ptorx and other APIs.
- Let's Encrypt or similar geniune TLS (SSL) certificate (no self-signed certs!) for your main domain where the instance of Ptorx will be hosted. Additional mail-only domains don't need this.
- Node.js installed on your server. Ptorx targets the latest version available at time of the last [server/package.json](https://github.com/Xyfir/ptorx/blob/master/server/package.json) update.
- MariaDB or MySQL installed on your server. Ptorx.com runs MariaDB so there may be unknown discrepancies with MySQL.
- sendmail installed on your server. (Make sure your server's hostname is set correctly to prevent slow mail!)
- iptables-persistent installed on your server.

# Step 0: Clone the Repo

First change to the directory where you wish to keep Ptorx.

```bash
git clone --recurse-submodules https://github.com/Xyfir/ptorx.git
cd ptorx
```

From now on we'll assume commands are run from `ptorx/`.

# Step 1: Download npm Dependencies

Install npm depencies for each module:

```bash
cd server
npm install
cd ../web
npm install
cd ../accownt/server
npm install
cd ../web
npm install
cd ../../ccashcow/server
npm install
cd ../web
npm install
cd ../../yalcs/loader
npm install
cd ../server
npm install
cd ../web
npm install
cd ../../ # back to ptorx/
```

Then install pm2 to manage our API servers:

```bash
npm install -g pm2
```

Technically pm2 is not required, but it's what we'll use for this tutorial.

# Step 2: Create Database

Create a database and preferably a non-root MySQL user with `SELECT`, `INSERT`, `UPDATE`, and `DELETE` privileges as well. We'll name our database `ptorx` but any name will do.

```bash
sudo mysql -u root -e "CREATE DATABASE ptorx"
```

Next we'll build the database:

```bash
sudo mysql -u root -p ptorx < server/db/build/structure.sql
sudo mysql -u root -p ptorx < server/db/build/data.sql
```

Replace `ptorx` with the name of your database.

# Step 3: Create Data Directories

Now we need to create the data directories where Ptorx and its submodules will write both temporary and permanent data to the disk. You can put them wherever you'd like (just remember it for Step 4), but for now we'll put them alongside `ptorx/`.

```bash
mkdir ../accownt-db ../mail-cache ../ccashcow-db ../yalcs-db
```

You can also name the three directories however you'd like.

# Step 4: Set Environment Variables

Ptorx and its submodules are configured via environment variables which are loaded into the applications via `.env` files located in each modules's directory.

To understand the syntax of the `.env` files, know that they are first loaded via [dotenv](https://www.npmjs.com/package/dotenv) and then the string values provided by dotenv are parsed by [enve](https://www.npmjs.com/package/dotenv).

## Step 4a: Create `.env` Files

First we'll create each file and then we'll work our way through populating them with values.

```bash
touch server/.env web/.env accownt/server/.env accownt/web/.env ccashcow/server/.env ccashcow/web/.env
```

## Step 4b: Configure CCashCow

See [Xyfir/ccashcow](https://github.com/Xyfir/ccashcow) for instructions.

Use `vim` or `nano` or similar to edit the files `ccashcow/server/.env` and `ccashcow/web/.env`.

## Step 4c: Configure Accownt

See [Xyfir/accownt](https://github.com/Xyfir/accownt) for instructions.

Edit the files `accownt/server/.env` and `accownt/web/.env`.

## Step 4d: Configure Yalcs

See [Xyfir/yalcs](https://github.com/Xyfir/yalcs) for instructions.

Edit the files `yalcs/loader/.env`, `yalcs/server/.env`, and `yalcs/web/.env`.

## Step 4e: Configure Ptorx

Now we'll do the same thing for Ptorx. You can find the available environment variables in [types/ptorx.d.ts](https://github.com/Xyfir/ptorx/blob/master/types/ptorx.d.ts) under the `Ptorx.Env` namespace.

# Step 5: Build From Source

```bash
cd server
npm run build
cd ../web
npm run build
cd ../accownt/server
npm run build
cd ../web
npm run build
cd ../../ccashcow/server
npm run build
cd ../web
npm run build
cd ../../yalcs/loader
npm run build
cd ../server
npm run build
cd ../web
npm run build
cd ../../
```

# Step 6: Open and Forward Ports

Make sure your firewall allows traffic through the needed ports. If you're using `ufw`, it'll look something like:

```bash
sudo ufw allow smtp # 25
sudo ufw allow submission # 587
sudo ufw allow 2071 # -> 25
sudo ufw allow 2076 # -> 587
```

Next we'll need to forward incoming traffic from port `25` to the port you set for the MTA server via `MTA_PORT` in `server/.env`. We'll also forward `587` to the port for the MSA server, as configured via `MSA_PORT`. We'll assume the suggested ports for each.

```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 25 -j REDIRECT --to-port 2071
sudo iptables -t nat -A PREROUTING -p tcp --dport 587 -j REDIRECT --to-port 2076
sudo iptables -t nat -nvL # optionally validate your rules
iptables-save > /etc/iptables/rules.v4
```

## Suggested Ports

Ptorx requires a lot of servers. The suggested _local_ ports are as follows:

| Name                   | Port |
| ---------------------- | ---- |
| Ptorx API              | 2070 |
| Ptorx MTA              | 2071 |
| Ptorx test MTA         | 2072 |
| Ptorx client (for dev) | 2073 |
| Accownt                | 2074 |
| CCashCow               | 2075 |
| Ptorx MSA              | 2076 |
| Yalcs                  | 2079 |

# Step 7: Set DNS Records

For this step, we'll be using `example.com` as a placeholder for your domain.

## Step 7a: DKIM

First of all, set the domain key TXT record to `<SELECTOR>._domainkey.example.com` as provided by the Ptorx app after you've added your domain. Ignore the other records it tells you to set.

## Step 7b: MX

Create a single MX record for `example.com` that points to your server's IP address, which will probably be the same as your domain's A record. The priority doesn't matter with only a single server, but we'll set it to `10`.

## Step 7c: SPF

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Create a TXT record for `example.com` with something like this:

```
"v=spf1 +a ~all"
```

Before you blindly copy and paste, you should understand how SPF works and how best to utilize it according your needs.

## Step 7d: DMARC

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Create a TXT record for `_dmarc.example.com` with something like this:

```
"v=DMARC1; p=reject; fo=1; rua=mailto:aggregate-dmarc-x@example.com; ruf=mailto:fail-dmarc-x@example.com"
```

Before you blindly copy and paste, you should understand how DMARC works and how best to utilize it according your needs.

## Step 7e: Reverse DNS

_This step is optional but highly recommended to prevent your mail from being marked as spam._

Go to your server host's control panel and change the reverse DNS to your domain name. By default its value probably looks something like `0.0.0.0.yourhost.com` where `0.0.0.0` is your server's IPv4 address and `yourhost.com` is the name of your server host. For example with [VULTR](https://www.vultr.com/?ref=7140527), which Ptorx uses, it'll look like `140.82.16.198.vultr.com`, and it can be found under the `Settings > IPv4` tab when viewing your server instance.

# Step 8: Start Servers

Last but not least, start the servers with pm2, which you should have installed earlier:

```bash
cd server
pm2 start --name ptorx npm -- run start
cd ../accownt/server
pm2 start --name accownt npm -- run start
cd ../../ccashcow/server
pm2 start --name ccashcow npm -- run start
cd ../../yalcs/server
pm2 start --name yalcs npm -- run start
cd ../../
pm2 startup # then follow instructions
```

# Upgrading Ptorx

This is a general guide for upgrading from one version of Ptorx to another. It's likely there are more specific steps you'll have to follow based on your current version and that of which you wish to upgrade to, but these steps should typically get you at least 90% of the way there.

To begin the process of upgrading Ptorx, let's first reset the repos and pull in changes:

```bash
git reset --hard origin/master
git submodule foreach git reset --hard
git pull
git submodule update --recursive
```

Now we'll once again run through some of the steps above:

- Go to [Step 1](#step-1-download-npm-dependencies) to update dependencies.
- Go to [Step 4](#step-4-set-environment-variables) to update any `.env` files that may require changes.
- Go to [Step 5](#step-5-build-from-source) to rebuild the apps.

Update your database if needed by running _in order_ the `server/db/upgrade/` SQL files for every version _after_ your current installation's. For example, assuming you're on version `1.0.0` and the latest is `1.1.0`:

```bash
sudo mysql -u root -p ptorx < server/db/upgrade/1.0.1.sql
sudo mysql -u root -p ptorx < server/db/upgrade/1.0.2.sql
sudo mysql -u root -p ptorx < server/db/upgrade/1.1.0.sql
```

Be sure to replace `ptorx` with the actual name of your database.

Finally, restart the servers:

```bash
pm2 restart all
```

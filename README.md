# Tor Anonymity Network Visualization using D3.js and OnionScan
This Hive Plot visualization explores anonymity on the highly connected Dark Web using D3.js. Although sites on the darknet offer to protect the privacy of their visitors and owner, administrators can inadvertently leak details that put everyone at risk. Staying anonymous on the so-called dark web is hard and it doesn’t guarantee security. This visualization wants to uncover the true privacy infrastructure of the Tor anonymity network and provide a tool to understand network properties that threaten the privacy of these services. 

This visualization uses OnionScan  to scan 8,176 .onion hidden services on the Tor  anonymity network and gather various identifying metadata associated with them. We use this metadata in various ways within the hive table to explore relationships and patterns between hidden services using identity correlations such as IP addresses, SSH keys,  PGP fingerprint keys, related Clearnet sites. Curved links connect related entities. A lot of interesting exploratory work can be done with this data to begin to uncover relationships and patterns regarding privacy preservation and anonymity networks on the Dark Web.

## Implementation
I used D3.js to create this visualization along with Python for data collection, cleaning, aggregation and preparation into the correct data structures and JSON format for parsing.

### Visual Encoding
#### Hidden Services
Hidden services are colour encoded in red and positioned on their axis according to their weighted security score. The security score is calculated based on the found PGP and SSH keys, whether an Apache mod_status leak was present, open directories, bitcoin addresses and server fingerprints. 
#### Clearnet TLDs
The Clearnet services associated with a hiddens service are grouped by their top-level domain. The Clearnet TLDs are positionally encoded on their axis based on degree or connectedness to represent their reference popularity on the dark net. Through link graph analysis and following hyperlinks, large proportions of seemingly unrelated sited can be connected to each other. This visualization shows that even when sites don’t relate with each other, they can be connected by the other identity correlations on different axes. 
#### IP addresses
OnionScan returns the found IP addresses for a .onion site. This data is plotted on its own axis and are positionally encoded by Class A. The presence of these leaked IP addresses picked up by OnionScan can completely deanonymize and onion service.
#### SSH Keys and PGP Key Fingerprints
Both the PGP and SSH keys are positionally encoded based on the hashed first two hexadecimal characters of their key. I represented SSH keys as their own entities on the hive plot as I was interested in visualizing whether SSH fingerprints are truly unique. I wanted to investigate how misconfigurations resulting in duplicate SSH keys might damage anonymity on the dark net. SSH endpoints  are also an important privacy indicator as they can be correlated against other Clearnet and hidden services to identify actual server location. PGP Keys are represented on the same “Keys” axis as the SSH keys. Discovered PGP keys, depending on how they are used, hold high risk in making identification of their owner trivially easy. 

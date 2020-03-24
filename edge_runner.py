import glob
import json
from collections import defaultdict
from hashlib import md5
import random
from argparse import ArgumentParser
from math import log2, log10

file_list = glob.glob("onionscan_results/*.json")

hidden_services = defaultdict(lambda: 0)
onion_domains = defaultdict(lambda: [])
clearnet_domains = defaultdict(lambda: [])
ip_addresses = defaultdict(lambda: [])
ssh_keys = defaultdict(lambda: [])
pgp_keys = defaultdict(lambda: [])

"""
Generate UID for hidden_service, ip_address and clearnet_service
"""


def get_id(value):
    return value.replace('.', '_').replace(';', '__').replace('&', '_')


"""
Generate the JSON data to create Hive chart
x = 0 is a hidden service node
x = 1 is an ip address node
x = 2 is a clearnet service node

"""


def create_json(hidden_services, clearnet_domains, ip_addresses, ssh_keys, pgp_keys):

    data = {}
    data["nodes"] = []
    data["links"] = []

# hidden service positioned on axis depending on security score. closer to hive is least secure
    max_degree = log2(max(hidden_services.values()))
    for hidden_service, score in hidden_services.items():
        data["nodes"].append({
            "id": get_id(hidden_service),
            "type": "hidden_service",  "name": hidden_service, "x": 0, "y": 1 - log2(score or 1)/max_degree})

# clearnet sites are positioned by connectiveness or degree
    max_degree = log2(max([len(x) for x in clearnet_domains.values()]))
    for clearnet_service, hidden_services in clearnet_domains.items():
        data["nodes"].append({
            "id": get_id(clearnet_service),
            "type": "clearnet_service", "name": clearnet_service, "x": 1, "y": 1 - log2(len(hidden_services) or 1)/max_degree})
        for hidden_service in hidden_services:
            data["links"].append({
                "sourceNodeId": get_id(clearnet_service),
                "targetNodeId": get_id(hidden_service)
            })
    # ssh keys
    max_degree = max([len(x) for x in ssh_keys.values()])
    for ssh_key, hidden_services in ssh_keys.items():
        data["nodes"].append({
            "id": get_id(ssh_key),
            "type": "ssh_key",  "name": ssh_key, "x": 2, "y": (len(hidden_services)/max_degree) + random.random() * 0.1})
        for hidden_service in hidden_services:
            data["links"].append({
                "sourceNodeId": get_id(ssh_key),
                "targetNodeId": get_id(hidden_service)
            })
    # pgp keys
    max_degree = max([len(x) for x in pgp_keys.values()])
    for pgp_key, hidden_services in pgp_keys.items():
        data["nodes"].append({
            "id": get_id(pgp_key),
            "type": "pgp_key",  "name": pgp_key, "x": 2, "y": len(hidden_services)/max_degree})
        for hidden_service in hidden_services:
            data["links"].append({
                "sourceNodeId": get_id(pgp_key),
                "targetNodeId": get_id(hidden_service)
            })

# IP addresses are positoned and grouped by class A grouping
    for ip_address, hidden_services in ip_addresses.items():
        data["nodes"].append({
            "id": get_id(ip_address),
            "type": "ip_address",  "name": ip_address, "x": 3, "y": 1-(int(ip_address.split('.')[0])/255)})
        for hidden_service in hidden_services:
            data["links"].append({
                "sourceNodeId": get_id(ip_address),
                "targetNodeId": get_id(hidden_service)
            })

    with open("hive_data.json", "w") as outfile:
        json.dump(data, outfile)


def create_dot(hidden_services, clearnet_domains, ip_addresses, ssh_keys, pgp_keys):
    """
    Generating .dot file for visualizing data in jhive

    hidden_services -- The list of hidden services
    """

    with open("data.dot", "w") as f:
        f.write("digraph DarkNet {\n")
        for hidden_service, score in hidden_services.items():
            f.write(
                f"{get_id(hidden_service)} [service_type=hidden name={hidden_service} incoming_links={len(onion_domains[hidden_service])}]\n")

        # for onion_domain, hidden_services in onion_domains.items():
        #     # f.write(
        #     #     f"{get_id(onion_domain)} [type=hidden_service name={onion_domain}]\n")
        #     f.writelines(map(
        #         lambda hidden_service: f"{get_id(hidden_service)} -> {get_id(onion_domain)}\n", hidden_services))

        for clearnet_domain, hidden_services in clearnet_domains.items():
            f.write(
                f"{get_id(clearnet_domain)} [service_type=clearnet name={clearnet_domain}]\n")
            f.writelines(map(
                lambda hidden_service: f"{get_id(hidden_service)} -> {get_id(clearnet_domain)}\n", hidden_services))

        for ip_address, hidden_services in ip_addresses.items():
            f.write(
                f"{get_id(ip_address)} [service_type=ip name={ip_address}]\n")
            f.writelines(map(
                lambda hidden_service: f"{get_id(hidden_service)} -> {get_id(ip_address)}\n", hidden_services))
        f.write("}")


"""
ArgParser to create .dot file or JSON file
"""


def parse_args():
    parser = ArgumentParser(
        description="format onionscan data for visualization in D3 or jhive.")
    parser.add_argument("--json", action='store_true',
                        help="generate JSON file for D3")
    parser.add_argument("--dot", action='store_true',
                        help="generate .dot file for jhive")
    return parser.parse_args()


def main(args):

    for json_file in file_list:

        with open(json_file, "rb") as fd:

            scan_result = json.load(fd)

            hidden_services[scan_result['hiddenService']] = 0

            for key, value in scan_result.items():
                if value is not None and value != "" and value != [] and value != {}:
                    score = 1

                    if isinstance(value, list) or isinstance(value, dict):
                        score = max(1, len(value) / 0.5)

                    if key == "pgpKeys":
                        score = 20
                    elif key == "sshKey":
                        score = 10
                    elif key.startswith("server"):
                        score = 5

                    hidden_services[scan_result['hiddenService']] += score

            edges = []

            if scan_result['linkedSites'] is not None:
                edges.extend(scan_result['linkedSites'])
            if scan_result['relatedOnionDomains'] is not None:
                edges.extend(scan_result['relatedOnionDomains'])

            if scan_result['relatedOnionServices'] is not None:
                edges.extend(scan_result['relatedOnionServices'])

            if scan_result['pgpKeys'] is not None:
                for pgp_key in scan_result['pgpKeys']:
                    pgp_keys[pgp_key['fingerprint']].append(
                        scan_result['hiddenService'])

            if scan_result['sshKey'] is not None:
                ssh_keys[scan_result['sshKey']].append(
                    scan_result['hiddenService'])

            for edge in edges:
                if edge.endswith(".onion"):
                    onion_domains[edge].append(scan_result['hiddenService'])
                    hidden_services[edge] += 0
                else:
                    tld = ".".join(edge.split('.')[-1:])
                    clearnet_domains[tld].append(scan_result['hiddenService'])

            if scan_result['ipAddresses'] is not None:
                for ip in scan_result['ipAddresses']:
                    ip_addresses[ip].append(scan_result['hiddenService'])
    if args.json:
        create_json(hidden_services, clearnet_domains,
                    ip_addresses, ssh_keys, pgp_keys)
    elif args.dot:
        create_dot(hidden_services, clearnet_domains,
                   ip_addresses, ssh_keys, pgp_keys)
    else:
        return


if __name__ == '__main__':
    args = parse_args()
    main(args=args)

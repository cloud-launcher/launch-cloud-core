Sorry for any confusion. This is something I'm still thinking about and I have yet to work out all of the details. I don't mean for this to be formal proposal, but more a discussion about some issues I've been anticipating (and have started to run into) that could lead to a proposal.

I think you are right that there are two distinct things going on: configuration and interface definition. Both need a solution and I'm not entirely sure if they can both be solved at this level, but I do think it may be possible and I think a solution could simplify some of the higher layers.

I'll give an example of the representations I'm currently working with, which will hopefully lead to the motivations behind what I'm trying to get at.

Given a system description:
````
{
  root: 'https://your_root/'
  configuration: {
    api: 1,
    postgresql: 1
    influxdb: 1
  },
  roles: {
    $all: ['cadvisor']
  },
  containers: {
    cadvisor: {
      container: 'google/cadvisor'
    },
    postgresql: {
      container: 'vendor/postgresql'
    },
    influxdb: {
      container: 'vendor/influxdb'
    }
  }
}
````

This is trivially expanded out to a 'fully-qualified' description. (See footnote.)

What I really want is to be able to take this system description and automatically produce a running system, all appropriately wired up in the way you would expect (ie. the `cadvisors` find their local `influxdb` & the `api` finds its local `postgresql`). However, to do this currently, you need additional metadata about what the various containers depend on.

There are two concerns at this point:

1. **How can I validate that the above system description is complete (ie. can be successfully deployed)?** [Interface Definition] That is, I (the system designer) know that `api` needs to connect to a `postgresql`, but there is nothing in the current Docker container or App Container formats that allows me to know that `api` depends on having a `postgresql` (or any other application/service). This makes automatic system composition impossible without having some additional, third-party, repository of metadata.

  The solution to this problem may be as simple as attaching names to a container:

  ````
  cadvisor: {
    provides: ['cadvisor-api'],
    optional: ['influxdb'],
  }

  influxdb: {
    provides: ['influxdb']
  }

  api: {
    requires: ['postgresql']
  }

  postgresql: {
    provides: ['postgresql']
  }
  ````

  The names can be URI's with a versioning scheme (most of which can be stripped out for the simplest case of: 'latest version').

  Additionally, to support the case you described, of, "it's mostly the postgresql interface, but really rethinkdb", the interface name should be abstracted away from pointing to a specific Container (although that could be allowed):

  ````
  my_rethinkdb: {
    provides: ['postgresqlABI']
  }

  my_container: {
    requires: ['postgresqlABI']
  }

  postgresql: {
    provides: ['postgresqlABI']
  }

  ````

  When dependency resolution occurs, either `my_rethinkdb` or `posgresql` can satisfy the requirement for `my_container` even though there is no container `postgresqlABI`.

  The primary value here is just recording the fact that one container depends on the existence of another container and exposing that fact in a way that can be automatically introspected (which is why I am bringing it to this forum).

  If the interface names are URIs then there may be additional metadata (configuration info?) available if you retrieve whatever is at the corresponding URL. I think this approach can give the application and tooling layers enormous power and flexibility with very little overhead cost in the Spec.


2. **How do I wire up the containers at run-time?** [Configuration] I don't know the best answer to this yet. I suppose that's what I was attempting to explore in the representation from the first post. Maybe setting environment variables is enough (although that approach alone might fail as the external environment changes). I'll have to think more about it, but encourage others to contribute any thoughts they have.

  I was talking to Redbeard several months ago and he was telling me about one of @cnelson's solutions to part of this problem, where (I believe) a container is presented a fixed IP address & port for a service and then another piece is responsible for manipulating `iptables` on the host to maintain a mapping to the actual service. I think this is a pretty nice solution and had considered implementing it myself (@cnelson, if you want to open up the code, I, and likely others, would be very grateful).


I'm sure you're aware that these representations are implicitly graphs. I plan to soon start work on a tool to visualize the graphs, which will possibly make it more clear what pieces may still be needed to realize the automatic composition of systems that I'm envisioning and (perhaps poorly) trying to describe.

I'm trying to get down to the very core representations necessary while trying to avoid (but still support) all of the messy details that can cloud what is *really* going on. I apologize if some of my representations seem to be missing something. That's because they *are*. I think that most things should be implied, but discoverable and overridable (which you can kind of see in the footnote below).

As I continue towards a complete, workable example, I hope some of these ideas will become more clear and succinct.


------------------

'Fully-qualified' expansion
````
{
  configuration: {
    api: 1,
    postgresql: 1
    influxdb: 1
  },
  roles: {
    api: ['cadvisor', 'api'],
    postgresql: ['cadvisor', 'postgresql'],
    influxdb: ['cadvisor', 'influxdb']
  },
  containers: {
    api: {
      container: 'https://your_root/project/api'
    },
    cadvisor: {
      container: 'https://google/cadvisor'
    },
    postgresql: {
      container: 'https://vendor1/postgresql'
    },
    influxdb: {
      container: 'https://vendor2/influxdb'
    }
  }
}
````

Notes:

1. These representations allow for many different variations (for example, nested roles, and nested configuration values), but I'm leaving them out for simplicity.
2. A role is generally mapped to a machine (virtual or physical).
3. There is a naming resolution scheme which can try various public repositories (Docker Hub, Quay), but here I just go to self-hosted URLs.


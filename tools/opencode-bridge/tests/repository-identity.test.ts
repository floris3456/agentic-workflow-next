import assert from "node:assert/strict";
import test from "node:test";
import {
  assertRepositoryRemote,
  githubRepositoryIdentity,
  parseSupportedGitRemote,
} from "../src/repository-identity.js";

const publicIdentity = githubRepositoryIdentity({
  apiBaseUrl: "https://api.github.com",
  owner: "Example-Owner",
  repository: "example.repository",
});

test("repository identity accepts exact public GitHub HTTPS and SSH forms", () => {
  for (const remote of [
    "https://github.com/example-owner/example.repository.git",
    "ssh://git@github.com/Example-Owner/example.repository.git",
    "ssh://git@github.com:22/Example-Owner/example.repository.git",
    "git@github.com:Example-Owner/example.repository.git",
  ]) assert.doesNotThrow(() => assertRepositoryRemote(remote, publicIdentity));
});

test("repository identity derives Enterprise hosts and requires explicit custom API Git hosts", () => {
  const enterprise = githubRepositoryIdentity({
    apiBaseUrl: "https://git.corp.example/api/v3",
    owner: "platform",
    repository: "workflow",
  });
  assert.equal(enterprise.gitHost, "git.corp.example");
  assert.doesNotThrow(() => assertRepositoryRemote("ssh://git@git.corp.example/platform/workflow.git", enterprise));

  assert.throws(() => githubRepositoryIdentity({
    apiBaseUrl: "https://api.corp.example/github/",
    owner: "platform",
    repository: "workflow",
  }), /git_host is required/);
  const custom = githubRepositoryIdentity({
    apiBaseUrl: "https://api.corp.example/github/",
    gitHost: "code.corp.example:8443",
    owner: "platform",
    repository: "workflow",
  });
  assert.doesNotThrow(() => assertRepositoryRemote("https://code.corp.example:8443/platform/workflow", custom));
  assert.throws(() => githubRepositoryIdentity({
    apiBaseUrl: "https://api.github.com",
    gitHost: "github.example",
    owner: "platform",
    repository: "workflow",
  }), /conflicts/);

  for (const apiBaseUrl of [
    "http://git.corp.example/api/v3",
    "https://user@git.corp.example/api/v3",
    "https://git.corp.example/api/v3?tenant=other",
    "https://git.corp.example/api/v3#other",
    "https://git.corp.example/api/v3/%2e%2e/custom",
  ]) assert.throws(() => githubRepositoryIdentity({
    apiBaseUrl,
    owner: "platform",
    repository: "workflow",
  }), apiBaseUrl);
});

test("repository identity rejects deceptive hosts, suffixes, paths, and userinfo", () => {
  for (const remote of [
    "https://github.com.evil.invalid/Example-Owner/example.repository.git",
    "https://evil.invalid/prefix/Example-Owner/example.repository.git",
    "https://github.com/other/Example-Owner/example.repository.git",
    "https://github.com/Example-Owner/example.repository.git/extra",
    "https://github.com@evil.invalid/Example-Owner/example.repository.git",
    "https://token@github.com/Example-Owner/example.repository.git",
    "https://github.com/Example-Owner%2fother/example.repository.git",
    "https://github.com/Example-Owner/../example.repository.git",
    "ssh://attacker@github.com/Example-Owner/example.repository.git",
    "ssh://git:password@github.com/Example-Owner/example.repository.git",
    "git@evilgithub.com:Example-Owner/example.repository.git",
    "git@github.com:prefix/Example-Owner/example.repository.git",
    "/local/Example-Owner/example.repository.git",
  ]) assert.throws(() => assertRepositoryRemote(remote, publicIdentity), remote);
});

test("remote parser rejects unsupported or ambiguous syntax instead of suffix matching", () => {
  assert.deepEqual(parseSupportedGitRemote("git@github.com:owner/repository.git"), {
    host: "github.com",
    owner: "owner",
    repository: "repository",
  });
  for (const remote of [
    "http://github.com/owner/repository",
    "git://github.com/owner/repository",
    "github.com/owner/repository",
    "git@github.com:owner//repository",
    " git@github.com:owner/repository",
    "git@github.com:owner/repository?x=1",
  ]) assert.throws(() => parseSupportedGitRemote(remote), remote);
});

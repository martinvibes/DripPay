import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import {
  OrganizationFactory,
  OrganizationFactory__factory,
  Organization,
  Organization__factory,
} from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
  dave: HardhatEthersSigner;
};

async function deployFactoryFixture() {
  const factory = (await ethers.getContractFactory(
    "OrganizationFactory",
  )) as OrganizationFactory__factory;
  const factoryContract =
    (await factory.deploy()) as OrganizationFactory;
  const factoryAddress = await factoryContract.getAddress();
  return { factoryContract, factoryAddress };
}

async function createOrgViaFactory(
  factoryContract: OrganizationFactory,
  name: string,
) {
  const tx = await factoryContract.createOrg(name);
  const receipt = await tx.wait();

  // Get org address from event
  const event = receipt?.logs.find((log) => {
    try {
      return factoryContract.interface.parseLog(log as any)?.name === "OrganizationCreated";
    } catch {
      return false;
    }
  });

  const parsed = factoryContract.interface.parseLog(event as any);
  const orgAddress = parsed?.args.orgAddress;

  const orgContract = Organization__factory.connect(
    orgAddress,
    factoryContract.runner,
  ) as Organization;

  return { orgContract, orgAddress };
}

describe("OrganizationFactory", function () {
  let signers: Signers;
  let factoryContract: OrganizationFactory;
  let factoryAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      carol: ethSigners[3],
      dave: ethSigners[4],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This test suite requires the FHEVM mock environment");
      this.skip();
    }
    ({ factoryContract, factoryAddress } = await deployFactoryFixture());
  });

  it("should deploy factory", async function () {
    expect(factoryAddress).to.be.properAddress;
  });

  it("should create an organization", async function () {
    const tx = await factoryContract.connect(signers.alice).createOrg("Acme Corp");
    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);

    const orgs = await factoryContract.getOrganizations(signers.alice.address);
    expect(orgs.length).to.equal(1);
  });

  it("should emit OrganizationCreated event", async function () {
    await expect(factoryContract.connect(signers.alice).createOrg("Acme Corp"))
      .to.emit(factoryContract, "OrganizationCreated")
      .withArgs(
        // orgAddress is dynamic, just check it was emitted
        (addr: string) => ethers.isAddress(addr),
        signers.alice.address,
        "Acme Corp",
      );
  });

  it("should track multiple orgs per admin", async function () {
    await (await factoryContract.connect(signers.alice).createOrg("Org A")).wait();
    await (await factoryContract.connect(signers.alice).createOrg("Org B")).wait();
    await (await factoryContract.connect(signers.bob).createOrg("Org C")).wait();

    const aliceOrgs = await factoryContract.getOrganizations(signers.alice.address);
    const bobOrgs = await factoryContract.getOrganizations(signers.bob.address);

    expect(aliceOrgs.length).to.equal(2);
    expect(bobOrgs.length).to.equal(1);
  });

  it("should return empty array for address with no orgs", async function () {
    const orgs = await factoryContract.getOrganizations(signers.bob.address);
    expect(orgs.length).to.equal(0);
  });

  it("should create org with empty name", async function () {
    const { orgContract: emptyOrg } = await createOrgViaFactory(
      factoryContract.connect(signers.alice),
      "",
    );
    expect(await emptyOrg.name()).to.equal("");
  });

  it("should set msg.sender as org admin", async function () {
    const { orgContract: org } = await createOrgViaFactory(
      factoryContract.connect(signers.bob),
      "Bob's Org",
    );
    expect(await org.admin()).to.equal(signers.bob.address);
  });

  it("each org should have a unique address", async function () {
    const { orgAddress: addr1 } = await createOrgViaFactory(
      factoryContract.connect(signers.alice),
      "Org A",
    );
    const { orgAddress: addr2 } = await createOrgViaFactory(
      factoryContract.connect(signers.alice),
      "Org A",
    );
    expect(addr1).to.not.equal(addr2);
  });
});

describe("Organization", function () {
  let signers: Signers;
  let factoryContract: OrganizationFactory;
  let orgContract: Organization;
  let orgAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      carol: ethSigners[3],
      dave: ethSigners[4],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This test suite requires the FHEVM mock environment");
      this.skip();
    }
    ({ factoryContract } = await deployFactoryFixture());
    ({ orgContract, orgAddress } = await createOrgViaFactory(
      factoryContract.connect(signers.alice),
      "Test Org",
    ));
  });

  describe("initialization", function () {
    it("should set correct name", async function () {
      expect(await orgContract.name()).to.equal("Test Org");
    });

    it("should set correct admin", async function () {
      expect(await orgContract.admin()).to.equal(signers.alice.address);
    });

    it("should start with no employees", async function () {
      const employees = await orgContract.getEmployees();
      expect(employees.length).to.equal(0);
    });
  });

  describe("addEmployee", function () {
    it("should add an employee with encrypted salary", async function () {
      const salary = 5000;
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(salary)
        .encrypt();

      const tx = await orgContract
        .connect(signers.alice)
        .addEmployee(
          signers.bob.address,
          encryptedInput.handles[0],
          encryptedInput.inputProof,
        );
      await tx.wait();

      const employees = await orgContract.getEmployees();
      expect(employees.length).to.equal(1);
      expect(employees[0]).to.equal(signers.bob.address);
      expect(await orgContract.isEmployee(signers.bob.address)).to.be.true;
    });

    it("should emit EmployeeAdded event", async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(5000)
        .encrypt();

      await expect(
        orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          ),
      )
        .to.emit(orgContract, "EmployeeAdded")
        .withArgs(signers.bob.address);
    });

    it("should revert if not admin", async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.bob.address)
        .add64(5000)
        .encrypt();

      await expect(
        orgContract
          .connect(signers.bob)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          ),
      ).to.be.revertedWithCustomError(orgContract, "OnlyAdmin");
    });

    it("should add multiple employees", async function () {
      const enc1 = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(5000)
        .encrypt();
      const enc2 = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(8000)
        .encrypt();
      const enc3 = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(3000)
        .encrypt();

      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, enc1.handles[0], enc1.inputProof)).wait();
      await (await orgContract.connect(signers.alice).addEmployee(signers.carol.address, enc2.handles[0], enc2.inputProof)).wait();
      await (await orgContract.connect(signers.alice).addEmployee(signers.dave.address, enc3.handles[0], enc3.inputProof)).wait();

      const employees = await orgContract.getEmployees();
      expect(employees.length).to.equal(3);
      expect(await orgContract.isEmployee(signers.bob.address)).to.be.true;
      expect(await orgContract.isEmployee(signers.carol.address)).to.be.true;
      expect(await orgContract.isEmployee(signers.dave.address)).to.be.true;
    });

    it("should handle zero salary", async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(0)
        .encrypt();

      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, encryptedInput.handles[0], encryptedInput.inputProof)).wait();
      expect(await orgContract.isEmployee(signers.bob.address)).to.be.true;

      // Run payroll — balance should still be 0
      await (await orgContract.connect(signers.alice).runPayroll()).wait();

      const encryptedBalance = await orgContract.balanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedBalance, orgAddress, signers.bob);
      expect(clearBalance).to.equal(0);
    });

    it("should revert if employee already added", async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(5000)
        .encrypt();

      await (
        await orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          )
      ).wait();

      const encryptedInput2 = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(6000)
        .encrypt();

      await expect(
        orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput2.handles[0],
            encryptedInput2.inputProof,
          ),
      ).to.be.revertedWithCustomError(orgContract, "AlreadyEmployee");
    });
  });

  describe("removeEmployee", function () {
    beforeEach(async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(5000)
        .encrypt();

      await (
        await orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          )
      ).wait();
    });

    it("should remove an employee", async function () {
      await (
        await orgContract.connect(signers.alice).removeEmployee(signers.bob.address)
      ).wait();

      const employees = await orgContract.getEmployees();
      expect(employees.length).to.equal(0);
      expect(await orgContract.isEmployee(signers.bob.address)).to.be.false;
    });

    it("should emit EmployeeRemoved event", async function () {
      await expect(
        orgContract.connect(signers.alice).removeEmployee(signers.bob.address),
      )
        .to.emit(orgContract, "EmployeeRemoved")
        .withArgs(signers.bob.address);
    });

    it("should revert if not admin", async function () {
      await expect(
        orgContract.connect(signers.bob).removeEmployee(signers.bob.address),
      ).to.be.revertedWithCustomError(orgContract, "OnlyAdmin");
    });

    it("should revert if not an employee", async function () {
      await expect(
        orgContract
          .connect(signers.alice)
          .removeEmployee(signers.deployer.address),
      ).to.be.revertedWithCustomError(orgContract, "NotEmployee");
    });

    it("should correctly swap-and-pop when removing from middle", async function () {
      // Add carol and dave too (bob already added in beforeEach)
      const enc1 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(6000).encrypt();
      const enc2 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(7000).encrypt();
      await (await orgContract.connect(signers.alice).addEmployee(signers.carol.address, enc1.handles[0], enc1.inputProof)).wait();
      await (await orgContract.connect(signers.alice).addEmployee(signers.dave.address, enc2.handles[0], enc2.inputProof)).wait();

      // Employees: [bob, carol, dave]. Remove bob (index 0) — dave should swap in.
      await (await orgContract.connect(signers.alice).removeEmployee(signers.bob.address)).wait();

      const employees = await orgContract.getEmployees();
      expect(employees.length).to.equal(2);
      // bob removed, carol and dave remain
      expect(await orgContract.isEmployee(signers.bob.address)).to.be.false;
      expect(await orgContract.isEmployee(signers.carol.address)).to.be.true;
      expect(await orgContract.isEmployee(signers.dave.address)).to.be.true;
    });

    it("should allow re-adding a removed employee", async function () {
      await (await orgContract.connect(signers.alice).removeEmployee(signers.bob.address)).wait();
      expect(await orgContract.isEmployee(signers.bob.address)).to.be.false;

      const encryptedInput = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(9000).encrypt();
      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, encryptedInput.handles[0], encryptedInput.inputProof)).wait();

      expect(await orgContract.isEmployee(signers.bob.address)).to.be.true;
      const employees = await orgContract.getEmployees();
      expect(employees.length).to.equal(1);
    });

    it("should revert when removing same employee twice", async function () {
      await (await orgContract.connect(signers.alice).removeEmployee(signers.bob.address)).wait();
      await expect(
        orgContract.connect(signers.alice).removeEmployee(signers.bob.address),
      ).to.be.revertedWithCustomError(orgContract, "NotEmployee");
    });
  });

  describe("runPayroll", function () {
    it("should execute payroll and accumulate balance", async function () {
      const salary = 5000;
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(salary)
        .encrypt();

      await (
        await orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          )
      ).wait();

      // Run payroll once
      await (await orgContract.connect(signers.alice).runPayroll()).wait();

      // Check Bob's balance is now equal to salary
      const encryptedBalance = await orgContract.balanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        orgAddress,
        signers.bob,
      );
      expect(clearBalance).to.equal(salary);
    });

    it("should accumulate balance over multiple payrolls", async function () {
      const salary = 3000;
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(salary)
        .encrypt();

      await (
        await orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          )
      ).wait();

      // Run payroll twice
      await (await orgContract.connect(signers.alice).runPayroll()).wait();
      await (await orgContract.connect(signers.alice).runPayroll()).wait();

      const encryptedBalance = await orgContract.balanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        orgAddress,
        signers.bob,
      );
      expect(clearBalance).to.equal(salary * 2);
    });

    it("should emit PayrollExecuted event", async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(5000)
        .encrypt();

      await (
        await orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          )
      ).wait();

      await expect(orgContract.connect(signers.alice).runPayroll()).to.emit(
        orgContract,
        "PayrollExecuted",
      );
    });

    it("should revert if not admin", async function () {
      await expect(
        orgContract.connect(signers.bob).runPayroll(),
      ).to.be.revertedWithCustomError(orgContract, "OnlyAdmin");
    });

    it("should succeed with zero employees", async function () {
      // No employees added — should not revert, just emit event with count 0
      await expect(orgContract.connect(signers.alice).runPayroll()).to.emit(orgContract, "PayrollExecuted");
    });

    it("should pay multiple employees with different salaries correctly", async function () {
      const bobSalary = 5000;
      const carolSalary = 12000;

      const enc1 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(bobSalary).encrypt();
      const enc2 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(carolSalary).encrypt();

      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, enc1.handles[0], enc1.inputProof)).wait();
      await (await orgContract.connect(signers.alice).addEmployee(signers.carol.address, enc2.handles[0], enc2.inputProof)).wait();

      await (await orgContract.connect(signers.alice).runPayroll()).wait();

      const bobBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      const carolBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.carol.address), orgAddress, signers.carol);

      expect(bobBalance).to.equal(bobSalary);
      expect(carolBalance).to.equal(carolSalary);
    });

    it("should not pay removed employees", async function () {
      const enc1 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(5000).encrypt();
      const enc2 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(8000).encrypt();

      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, enc1.handles[0], enc1.inputProof)).wait();
      await (await orgContract.connect(signers.alice).addEmployee(signers.carol.address, enc2.handles[0], enc2.inputProof)).wait();

      // Pay once
      await (await orgContract.connect(signers.alice).runPayroll()).wait();

      // Remove bob, pay again
      await (await orgContract.connect(signers.alice).removeEmployee(signers.bob.address)).wait();
      await (await orgContract.connect(signers.alice).runPayroll()).wait();

      // Carol got 2 payrolls, bob only got 1
      const carolBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.carol.address), orgAddress, signers.carol);
      expect(carolBalance).to.equal(8000 * 2);

      // Bob's balance still accessible (not cleared), but only has 1 payroll worth
      const bobBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      expect(bobBalance).to.equal(5000);
    });

    it("should emit correct employee count in PayrollExecuted", async function () {
      const enc1 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(5000).encrypt();
      const enc2 = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(8000).encrypt();

      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, enc1.handles[0], enc1.inputProof)).wait();
      await (await orgContract.connect(signers.alice).addEmployee(signers.carol.address, enc2.handles[0], enc2.inputProof)).wait();

      // Check the employeeCount arg in the event
      const tx = await orgContract.connect(signers.alice).runPayroll();
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log) => {
        try { return orgContract.interface.parseLog(log as any)?.name === "PayrollExecuted"; } catch { return false; }
      });
      const parsed = orgContract.interface.parseLog(event as any);
      expect(parsed?.args.employeeCount).to.equal(2);
    });
  });

  describe("withdraw", function () {
    const salary = 10000;

    beforeEach(async function () {
      // Add Bob as employee with salary
      const encryptedInput = await fhevm
        .createEncryptedInput(orgAddress, signers.alice.address)
        .add64(salary)
        .encrypt();

      await (
        await orgContract
          .connect(signers.alice)
          .addEmployee(
            signers.bob.address,
            encryptedInput.handles[0],
            encryptedInput.inputProof,
          )
      ).wait();

      // Run payroll so Bob has balance
      await (await orgContract.connect(signers.alice).runPayroll()).wait();
    });

    it("should allow employee to withdraw", async function () {
      const withdrawAmount = 4000;
      const encryptedWithdraw = await fhevm
        .createEncryptedInput(orgAddress, signers.bob.address)
        .add64(withdrawAmount)
        .encrypt();

      await (
        await orgContract
          .connect(signers.bob)
          .withdraw(
            encryptedWithdraw.handles[0],
            encryptedWithdraw.inputProof,
          )
      ).wait();

      const encryptedBalance = await orgContract.balanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        orgAddress,
        signers.bob,
      );
      expect(clearBalance).to.equal(salary - withdrawAmount);
    });

    it("should not deduct if withdraw amount exceeds balance", async function () {
      const withdrawAmount = salary + 5000; // more than balance
      const encryptedWithdraw = await fhevm
        .createEncryptedInput(orgAddress, signers.bob.address)
        .add64(withdrawAmount)
        .encrypt();

      await (
        await orgContract
          .connect(signers.bob)
          .withdraw(
            encryptedWithdraw.handles[0],
            encryptedWithdraw.inputProof,
          )
      ).wait();

      // Balance should remain unchanged
      const encryptedBalance = await orgContract.balanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        orgAddress,
        signers.bob,
      );
      expect(clearBalance).to.equal(salary);
    });

    it("should emit Withdrawal event", async function () {
      const encryptedWithdraw = await fhevm
        .createEncryptedInput(orgAddress, signers.bob.address)
        .add64(1000)
        .encrypt();

      await expect(
        orgContract
          .connect(signers.bob)
          .withdraw(
            encryptedWithdraw.handles[0],
            encryptedWithdraw.inputProof,
          ),
      )
        .to.emit(orgContract, "Withdrawal")
        .withArgs(signers.bob.address);
    });

    it("should revert if not an employee", async function () {
      const encryptedWithdraw = await fhevm
        .createEncryptedInput(orgAddress, signers.deployer.address)
        .add64(1000)
        .encrypt();

      await expect(
        orgContract
          .connect(signers.deployer)
          .withdraw(
            encryptedWithdraw.handles[0],
            encryptedWithdraw.inputProof,
          ),
      ).to.be.revertedWithCustomError(orgContract, "NotEmployee");
    });

    it("should drain balance to zero with exact withdrawal", async function () {
      const encryptedWithdraw = await fhevm
        .createEncryptedInput(orgAddress, signers.bob.address)
        .add64(salary) // withdraw exact balance
        .encrypt();

      await (await orgContract.connect(signers.bob).withdraw(encryptedWithdraw.handles[0], encryptedWithdraw.inputProof)).wait();

      const encryptedBalance = await orgContract.balanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedBalance, orgAddress, signers.bob);
      expect(clearBalance).to.equal(0);
    });

    it("should handle multiple partial withdrawals", async function () {
      // Withdraw 3000, then 2000, then 4000 from 10000 balance
      const w1 = await fhevm.createEncryptedInput(orgAddress, signers.bob.address).add64(3000).encrypt();
      await (await orgContract.connect(signers.bob).withdraw(w1.handles[0], w1.inputProof)).wait();

      const w2 = await fhevm.createEncryptedInput(orgAddress, signers.bob.address).add64(2000).encrypt();
      await (await orgContract.connect(signers.bob).withdraw(w2.handles[0], w2.inputProof)).wait();

      const w3 = await fhevm.createEncryptedInput(orgAddress, signers.bob.address).add64(4000).encrypt();
      await (await orgContract.connect(signers.bob).withdraw(w3.handles[0], w3.inputProof)).wait();

      const clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      expect(clearBalance).to.equal(salary - 3000 - 2000 - 4000); // 1000
    });

    it("should handle withdraw of zero amount", async function () {
      const encryptedWithdraw = await fhevm
        .createEncryptedInput(orgAddress, signers.bob.address)
        .add64(0)
        .encrypt();

      await (await orgContract.connect(signers.bob).withdraw(encryptedWithdraw.handles[0], encryptedWithdraw.inputProof)).wait();

      const clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      expect(clearBalance).to.equal(salary); // unchanged
    });

    it("should allow withdraw after payroll tops up balance", async function () {
      // Withdraw everything
      const w1 = await fhevm.createEncryptedInput(orgAddress, signers.bob.address).add64(salary).encrypt();
      await (await orgContract.connect(signers.bob).withdraw(w1.handles[0], w1.inputProof)).wait();

      let clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      expect(clearBalance).to.equal(0);

      // Run payroll again — balance should refill
      await (await orgContract.connect(signers.alice).runPayroll()).wait();

      clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      expect(clearBalance).to.equal(salary);

      // Partial withdraw after refill
      const w2 = await fhevm.createEncryptedInput(orgAddress, signers.bob.address).add64(7000).encrypt();
      await (await orgContract.connect(signers.bob).withdraw(w2.handles[0], w2.inputProof)).wait();

      clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      expect(clearBalance).to.equal(salary - 7000);
    });

    it("should protect balance when multiple oversized withdrawals attempted", async function () {
      // Try withdrawing more than balance three times — balance stays same
      for (let i = 0; i < 3; i++) {
        const w = await fhevm.createEncryptedInput(orgAddress, signers.bob.address).add64(salary + 1).encrypt();
        await (await orgContract.connect(signers.bob).withdraw(w.handles[0], w.inputProof)).wait();
      }

      const clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, await orgContract.balanceOf(signers.bob.address), orgAddress, signers.bob);
      expect(clearBalance).to.equal(salary);
    });
  });

  describe("balanceOf", function () {
    it("should return zero handle for non-employee", async function () {
      const encryptedBalance = await orgContract.balanceOf(signers.deployer.address);
      expect(encryptedBalance).to.equal(ethers.ZeroHash);
    });

    it("should return zero balance before payroll", async function () {
      const enc = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(5000).encrypt();
      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, enc.handles[0], enc.inputProof)).wait();

      const encryptedBalance = await orgContract.balanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedBalance, orgAddress, signers.bob);
      expect(clearBalance).to.equal(0);
    });
  });

  describe("access control isolation", function () {
    it("employee of one org cannot call admin functions", async function () {
      // Bob is an employee, not admin
      const enc = await fhevm.createEncryptedInput(orgAddress, signers.alice.address).add64(5000).encrypt();
      await (await orgContract.connect(signers.alice).addEmployee(signers.bob.address, enc.handles[0], enc.inputProof)).wait();

      // Bob tries to add carol
      const enc2 = await fhevm.createEncryptedInput(orgAddress, signers.bob.address).add64(3000).encrypt();
      await expect(
        orgContract.connect(signers.bob).addEmployee(signers.carol.address, enc2.handles[0], enc2.inputProof),
      ).to.be.revertedWithCustomError(orgContract, "OnlyAdmin");

      // Bob tries to run payroll
      await expect(
        orgContract.connect(signers.bob).runPayroll(),
      ).to.be.revertedWithCustomError(orgContract, "OnlyAdmin");
    });

    it("different orgs are fully independent", async function () {
      // Alice creates Org A, Bob creates Org B
      const { orgContract: orgA, orgAddress: orgAAddr } = await createOrgViaFactory(
        factoryContract.connect(signers.alice), "Org A",
      );
      const { orgContract: orgB, orgAddress: orgBAddr } = await createOrgViaFactory(
        factoryContract.connect(signers.bob), "Org B",
      );

      // Add carol to Org A
      const enc1 = await fhevm.createEncryptedInput(orgAAddr, signers.alice.address).add64(5000).encrypt();
      await (await orgA.connect(signers.alice).addEmployee(signers.carol.address, enc1.handles[0], enc1.inputProof)).wait();

      // Carol is employee of Org A but not Org B
      expect(await orgA.isEmployee(signers.carol.address)).to.be.true;
      expect(await orgB.isEmployee(signers.carol.address)).to.be.false;

      // Alice cannot admin Org B
      await expect(
        orgB.connect(signers.alice).runPayroll(),
      ).to.be.revertedWithCustomError(orgB, "OnlyAdmin");
    });
  });
});

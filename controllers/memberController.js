const Member = require("../model/Member");

exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching members." });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMember = async (req, res) => {
  try {
    const {
      minSpend,
      membershipName,
      discountType, // ✅ FIXED
      discount,
      startDate,
      expirationDate,
      notes,
      restaurantId,
    } = req.body;

    // Validate required fields
    if (!minSpend || !membershipName || !discount || !expirationDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newMember = new Member({
      minSpend,
      membershipName,
      discountType, // ✅ FIXED
      discount,
      startDate: startDate || Date.now(),
      expirationDate,
      notes,
      restaurantId,
    });

    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    // Explicitly define the fields that can be updated for security and clarity
    const {
      minSpend,
      membershipName,
      discountType,
      discount,
      startDate,
      expirationDate,
      notes,
      status
    } = req.body;

    const updateData = {
      minSpend,
      membershipName,
      discountType,
      discount,
      startDate,
      expirationDate,
      notes,
      status
    };


    const updatedMember = await Member.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) return res.status(404).json({ message: "Member not found" });
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
<?php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'employee')]
class Employee
{
    #[ORM\Id]
    #[ORM\Column(type: 'integer')]
    #[ORM\GeneratedValue]
    public int $employee_id;

    #[ORM\Column(type: 'string')]
    public string $first_name;

    #[ORM\Column(type: 'string')]
    public string $last_name;

    #[ORM\Column(type: 'string', unique: true)]
    public string $work_email;

    #[ORM\Column(type: 'string')]
    public string $position;

    #[ORM\Column(type: 'string')]
    public string $hash;

    #[ORM\Column(type: 'string')]
    public string $salt;
}
?>